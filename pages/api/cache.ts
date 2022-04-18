import { NextApiResponse, NextApiRequest } from 'next'
import { YouTubeURL } from 'lib/youtube'
import moment from 'moment'
import { channels } from 'data/channels'
import path from 'path'
import fs from 'fs'
import { supabase } from 'lib/supabase'
import { Video } from 'models/Video'

const getYouTubeVideos = async (vids: string) => {
  const url = YouTubeURL('videos').toString()
  const items = await fetch(
    `${url}&part=snippet,status,liveStreamingDetails,contentDetails&id=${vids}`,
  )
    .then((res) => res.json())
    .then((data) => data.items)
  const videos: Video[] = items.map((item: any) => {
    const thumbnails = item.snippet.thumbnails
    const thumbnail =
      thumbnails.maxres ||
      thumbnails.standard ||
      thumbnails.high ||
      thumbnails.medium ||
      thumbnails.default
    return {
      id: item.id,
      title: item.snippet.title,
      channel: item.snippet.channelId,
      thumbnail: thumbnail.url,
      liveStatus: item.snippet.liveBroadcastContent,
      uploadStatus: item.status.uploadStatus,
      privacyStatus: item.status.privacyStatus,
      publishedAt: item.snippet.publishedAt,
      scheduledAt: item.liveStreamingDetails?.scheduledStartTime,
      startAt: item.liveStreamingDetails?.scheduledStartTime,
      endAt: item.liveStreamingDetails?.actualEndTime,
      duration: moment.duration(item.contentDetails.duration).asSeconds(),
    } as Video
  })
  return videos
}

const fetchFeed = async (channelId: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/feeds?channel=${channelId}`,
  )
  const feedJson = await res.json()
  const regexp = /yt:video:/
  const videos: Video[] = feedJson.items.map((item: any) => {
    return {
      id: `${item.id}`.replace(regexp, ''),
      channel: channelId,
      title: item.title,
      publishedAt: new Date(item.pubDate),
    } as Video
  })
  return videos.slice(0, 3)
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // 前回のCache更新からの時間経過を判定
  const cachePath = path.join(process.cwd(), 'data', 'cache.txt')
  if (fs.existsSync(cachePath)) {
    const cache = fs.readFileSync(cachePath, 'utf-8')
    const cacheDate = moment(cache, 'YYYY-MM-DD HH:mm:ss')
    if (cacheDate.isAfter(moment().subtract(30, 'seconds'))) {
      console.log('Cache is up to date')
      return res.status(200).json({
        message: 'Cache is up to date',
      })
    }
  }
  fs.writeFileSync(cachePath, moment().format('YYYY-MM-DD HH:mm:ss'))

  // Feedを取得して、Cacheを更新
  const feedsPath = path.join(process.cwd(), 'data', 'feeds.json')
  fs.existsSync(feedsPath) || fs.writeFileSync(feedsPath, '[]')
  const cachedFeeds: string[] = JSON.parse(
    fs.readFileSync(feedsPath, 'utf-8'),
  ).map((video: { id: string }) => video.id)
  const feeds = channels.map((channel) => fetchFeed(channel.id))
  const feedVideos = (await Promise.all(feeds)).flat()
  fs.writeFileSync(feedsPath, JSON.stringify(feedVideos))

  // Cacheと比較して、新しい動画を取得
  const newFeeds = feedVideos
    .filter((video) => !cachedFeeds.includes(video.id))
    .map((video) => video.id)
  console.log(`new: ${newFeeds.length} feeds`)

  // Cacheされた動画を取得
  const videosPath = path.join(process.cwd(), 'data', 'videos.json')
  fs.existsSync(videosPath) || fs.writeFileSync(videosPath, '[]')
  const cachedVideos: string[] = JSON.parse(
    fs.readFileSync(videosPath, 'utf-8'),
  ).map((video: { id: string }) => video.id)

  // 新しい動画を含め、YouTubeAPIを叩いて、動画情報を取得
  cachedVideos.push(...newFeeds)
  const needUpdates = Array.from(new Set(cachedVideos))
  const count = 1 + needUpdates.length / 50
  const videos = []
  for (let i = 0; i < count; i++) {
    const vids = needUpdates.slice(i * 50, (i + 1) * 50).join(',')
    const updated = await getYouTubeVideos(vids)
    videos.push(...updated.filter((video) => video.liveStatus !== 'none'))
  }
  fs.writeFileSync(path.join(videosPath), JSON.stringify(videos))
  console.log(`updated: ${videos.length} videos`)

  // DBを更新
  await supabase.from('video').upsert(videos)

  console.log('Done')
  res.status(200).end()
}

export default handler
