import { andThen, curry, map, pipe } from "ramda"
import Parser from "rss-parser"
import type { Video } from "@prisma/client"

type FeedItem = {
  title: string
  link: string
  author: string
  pubDate: string
  id: string
}

type Feed = {
  url: string
  title: string
  link: string
  author: string
}

const parser: Parser<Feed, FeedItem> = new Parser()

const parseFeed = (channelId: string) =>
  parser
    .parseURL(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    )
    .then(f => f.items.slice(0, 4) as FeedItem[])

const itemToVideo = (channelId: string, item: FeedItem) =>
  ({
    id: item.id.replace(/yt:video:/, ""),
    title: item.title,
    channelId,
    publishedAt: new Date(item.pubDate),
  } as Video)

const curriedItemToVideo = (channelId: string) => curry(itemToVideo)(channelId)

export const fetchChannelFeed = (channelId: string) =>
  pipe(parseFeed, andThen(map(curriedItemToVideo(channelId))))(channelId)
