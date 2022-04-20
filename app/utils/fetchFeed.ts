import { parser } from "./rssParser"
import type { Video } from "@prisma/client"

export const fetchFeed = async (channelId: string) => {
  const res = await parser.parseURL(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
  )
  const regexp = /yt:video:/
  const videos: Video[] = res.items.map((item: any) => {
    return {
      id: `${item.id}`.replace(regexp, ""),
      channelId: channelId,
      title: item.title,
      publishedAt: new Date(item.pubDate),
    } as Video
  })
  return videos
}
