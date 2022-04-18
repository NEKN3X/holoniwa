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
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      thumbnail: thumbnail.url,
      liveStatus: item.snippet.liveBroadcastContent,
      uploadStatus: item.status.uploadStatus,
      privacyStatus: item.status.privacyStatus,
      publishedAt: new Date(item.snippet.publishedAt),
      scheduledAt: new Date(item.liveStreamingDetails?.scheduledStartTime),
      startAt: new Date(item.liveStreamingDetails?.scheduledStartTime),
      endAt: new Date(item.liveStreamingDetails?.actualEndTime),
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
      channelId: channelId,
      channelTitle: item.author,
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
    if (cacheDate.isAfter(moment().subtract(10, 'seconds'))) {
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
  const cachedVideos = []
  if (fs.existsSync(videosPath)) {
    cachedVideos.push(
      ...JSON.parse(fs.readFileSync(videosPath, 'utf-8')).map(
        (video: { id: string }) => video.id,
      ),
    )
  } else {
    const { data } = await supabase
      .from('video')
      .select('id')
      .neq('liveStatus', 'none')
    if (data) {
      cachedVideos.push(...data.map((video: { id: string }) => video.id))
    }
  }

  // 新しい動画を含め、YouTubeAPIを叩いて、動画情報を取得
  cachedVideos.push(...newFeeds)
  const needUpdates = Array.from(new Set(cachedVideos))
  const count = needUpdates.length / 50

  const willCache = []
  const dbUpdate = []
  for (let i = 0; i < count; i++) {
    const vids = needUpdates.slice(i * 50, (i + 1) * 50).join(',')
    const updated = await getYouTubeVideos(vids)
    willCache.push(...updated.filter((video) => video.liveStatus !== 'none'))
    dbUpdate.push(...updated)
  }
  fs.writeFileSync(path.join(videosPath), JSON.stringify(willCache))
  console.log(`cached: ${willCache.length} videos`)

  // Cacheにはあるが、APIで取得できない動画をDBから消す
  // const noData = dbUpdate.filter((video) => !cachedVideos.includes(video.id))
  const updatedIds = dbUpdate.map((video) => video.id)
  cachedVideos
    .filter((video) => !updatedIds.includes(video))
    .forEach(async (video) => {
      await supabase.from('video').delete().eq('id', video)
    })

  const { error } = await supabase.from('video').upsert(dbUpdate)
  if (error) console.log(error)
  console.log(dbUpdate.map((video) => video.id).join(','))
  console.log(`updated: ${dbUpdate.length} videos`)

  console.log('done')

  return res.status(200).end()
}

export default handler
