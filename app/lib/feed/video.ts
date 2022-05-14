import { fetch } from "@remix-run/node"
import { map } from "ramda"
import Parser from "rss-parser"
import type { Video } from "@prisma/client"
import type { Immutable } from "immer"

const videosFeedParser: Parser<VideosFeed, VideosFeedItem> = new Parser()

export type VideosFeedItem = Immutable<{
  title: string
  link: string
  author: string
  pubDate: string
  id: string
}>

export type VideosFeed = Immutable<{
  url: string
  title: string
  link: string
  author: string
}>

const convertVideosFeedItem = (channelId: string, item: VideosFeedItem) => {
  return {
    id: item.id.replace(/yt:video:/, ""),
    title: item.title,
    channelId,
    publishedAt: new Date(item.pubDate),
  } as Video
}

export const parseVideosFeed = (channelId: string) =>
  fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)
    .then(res => res.text())
    .then(text => videosFeedParser.parseString(text))
    .then(f => f.items.slice(0, 4) as VideosFeedItem[])
    .then(map(item => convertVideosFeedItem(channelId, item)))
