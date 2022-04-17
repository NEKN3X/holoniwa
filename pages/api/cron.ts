import { NextApiResponse, NextApiRequest } from 'next'
import { prisma } from 'lib/prisma'
import { Video } from '@prisma/client'
import { YouTubeURL } from 'lib/youtube'
import moment from 'moment'
import { channel } from 'diagnostics_channel'
import { count } from 'console'

const updateVideo = async (videos: Video[]) => {
  const vids = videos
    .map((video: Video) => video.id)
    .reduce((acc, curr) => acc + ',' + curr)
  const url = YouTubeURL('videos').toString()
  fetch(
    `${url}&part=snippet,status,liveStreamingDetails,contentDetails&id=${vids}`,
  )
    .catch((e) => {
      throw new Error(e)
    })
    .then(async (res) => {
      const json = await res.json()
      if (!json.items || json.items.length === 0) return
      json.items.forEach(async (item: any) => {
        const thumbnails = item.snippet.thumbnails
        const thumbnail =
          thumbnails.maxres ||
          thumbnails.standard ||
          thumbnails.high ||
          thumbnails.medium ||
          thumbnails.default
        await prisma.video.update({
          where: { id: item.id },
          data: {
            thumbnail: thumbnail.url,
            description: item.snippet.description,
            liveStatus: item.snippet.liveBroadcastContent,
            uploadStatus: item.status.uploadStatus,
            privacyStatus: item.status.privacyStatus,
            startTime: item.liveStreamingDetails?.scheduledStartTime,
            endTime: item.liveStreamingDetails?.actualEndTime,
            scheduledTime: item.liveStreamingDetails?.scheduledStartTime,
            duration: moment.duration(item.contentDetails.duration).asSeconds(),
          },
        })
      })
    })
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
      title: item.title,
      publishedAt: new Date(item.pubDate),
    } as Video
  })
  return videos
}

const allChannels = async () => {
  return await prisma.channel.findMany()
}

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const auth = req.headers.authorization
  if (auth !== process.env.NEXT_PUBLIC_MY_API_KEY!) return res.status(401).end()

  // 全てのチャンネルに対する処理
  // allChannels().then((channels) => {
  //   channels.forEach(async (channel) => {
  //     // フィードから最新情報を取得
  //     const feeds = await fetchFeed(channel.id)
  //     const query = feeds.map((video) =>
  //       prisma.video.upsert({
  //         where: { id: video.id },
  //         update: {},
  //         create: { ...video, channelId: channel.id },
  //       }),
  //     )
  //     await prisma.$transaction([...query]).then(() => {
  //       console.log(`${channel.title} fetch`)
  //     })
  //   })
  // })
  let toggl = true
  while (toggl) {
    toggl = false
    prisma.video
      .findMany({
        where: {
          NOT: {
            liveStatus: 'none',
          },
        },
        take: 50,
      })
      .then((videos) => {
        if (videos.length === 0) return
        if (videos.length === 50) toggl = true
        updateVideo(videos)
        console.log(`${videos.length} live status update`)
      })
  }
  return res.status(200).end()
}

export default handler
