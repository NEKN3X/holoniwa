import { NextApiResponse, NextApiRequest } from 'next'
import { prisma } from 'lib/prisma'
import { Video } from '@prisma/client'
import { YouTubeURL } from 'lib/youtube'
import moment from 'moment'

const updateVideos = async (vids: string) => {
  const url = YouTubeURL('videos').toString()
  await fetch(
    `${url}&part=snippet,status,liveStreamingDetails,contentDetails&id=${vids}`,
  )
    .then((res) => res.json())
    .then((data) => data.items)
    .then((items) => {
      return items.map((item: any) => {
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
          description: item.snippet.description,
          liveStatus: item.snippet.liveBroadcastContent,
          uploadStatus: item.status.uploadStatus,
          privacyStatus: item.status.privacyStatus,
          startTime: item.liveStreamingDetails?.scheduledStartTime,
          endTime: item.liveStreamingDetails?.actualEndTime,
          scheduledTime: item.liveStreamingDetails?.scheduledStartTime,
          duration: moment.duration(item.contentDetails.duration).asSeconds(),
        }
      })
    })
    .then((updates) => {
      return updates.map((update: any) =>
        prisma.video.upsert({
          where: { id: update.id },
          update: update,
          create: update,
        }),
      )
    })
    .then(async (query) => await prisma.$transaction(query))
    .finally(() => {
      console.log('done')
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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const auth = req.headers.authorization
  if (auth !== process.env.NEXT_PUBLIC_MY_API_KEY!) return res.status(401).end()

  const channels = await allChannels()
  const needUpdates = channels.map(async (channel) => {
    const feeds = await fetchFeed(channel.id)
    const query = feeds.map(async (feed) => {
      const video = await prisma.video.findUnique({ where: { id: feed.id } })
      if (video?.liveStatus === 'none') return null
      return feed.id
    })
    return (await Promise.all(query)).filter((vid) => vid !== null)
  })
  await Promise.all(needUpdates)
    .then((needUpdates) =>
      needUpdates.flat().reduce((acc, curr) => acc + ',' + curr),
    )
    .then(async (vids) => {
      if (!vids) return
      await updateVideos(vids)
    })
    .then(() => res.status(200).end())
}

export default handler
