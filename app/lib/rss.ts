import { andThen, curry, flatten, map, pipe } from "ramda"
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

export const parseFeed = (channelId: string) =>
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

const curriedItemToVideo = (channelId: string) => (item: FeedItem) =>
  itemToVideo(channelId, item)

const getChannelFeed = (channelId: string) =>
  pipe(parseFeed, andThen(map(curriedItemToVideo(channelId))))(channelId)

export const getChannelsFeed = (channelIds: string[]) =>
  Promise.all(map(getChannelFeed)(channelIds))
