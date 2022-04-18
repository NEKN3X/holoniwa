import { NextApiResponse, NextApiRequest } from 'next'
import { prisma } from 'lib/prisma'
import { Video } from '@prisma/client'
import { YouTubeURL } from 'lib/youtube'
import moment from 'moment'
import { channels } from 'data/channels'
import path from 'path'
import fs from 'fs'

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
      channelId: item.snippet.channelId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      thumbnail: thumbnail.url,
      liveStatus: item.snippet.liveBroadcastContent,
      uploadStatus: item.status.uploadStatus,
      privacyStatus: item.status.privacyStatus,
      startTime: item.liveStreamingDetails?.scheduledStartTime,
      endTime: item.liveStreamingDetails?.actualEndTime,
      scheduledTime: item.liveStreamingDetails?.scheduledStartTime,
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
      title: item.title,
      publishedAt: new Date(item.pubDate),
    } as Video
  })
  return videos.slice(0, 3)
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const auth = req.headers.authorization
  if (auth !== process.env.NEXT_PUBLIC_MY_API_KEY!) return res.status(401).end()

  const dbVideos = await prisma.video.findMany({
    where: {
      liveStatus: {
        not: 'none',
      },
    },
    select: {
      id: true,
      liveStatus: true,
    },
  })
  if (dbVideos.length > 0) {
    await getYouTubeVideos(
      dbVideos.map((video) => video.id).reduce((acc, cur) => `${acc},${cur}`),
    )
      .then((videos) => {
        return videos.map((video) =>
          prisma.video.update({
            where: { id: video.id },
            data: {
              title: video.title,
            },
          }),
        )
      })
      .then(async (query) => {
        const videos = await prisma.$transaction(query)
        console.log(`Updated ${videos.length} videos`)
      })
  }

  const feeds = channels.map((channel) => fetchFeed(channel.id))
  const feedVideos = (await Promise.all(feeds)).flat()
  const jsonPath = path.join(process.cwd(), 'data', 'feeds.json')
  const cachedFeeds: string[] = JSON.parse(
    fs.readFileSync(jsonPath, 'utf-8'),
  ).map((video: { id: string }) => video.id)
  const newVideos = feedVideos.filter(
    (video) => !cachedFeeds.includes(video.id),
  )
  if (newVideos.length > 0) {
    const videos = await getYouTubeVideos(
      newVideos.map((video) => video.id).reduce((acc, cur) => `${acc},${cur}`),
    )
    await prisma.video.createMany({ data: videos })
    console.log(`Added ${videos.length} videos`)
  }
  fs.writeFileSync(jsonPath, JSON.stringify(feedVideos))

  console.log('Done')

  res.status(200).end()
}

export default handler
