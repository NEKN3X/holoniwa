import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import Parser from "rss-parser"
import type { Video } from "@prisma/client"

const videosFeedParser: Parser<VideosFeed, VideosFeedItem> = new Parser()

export type VideosFeedItem = {
  title: string
  link: string
  author: string
  pubDate: string
  id: string
}

export type VideosFeed = {
  url: string
  title: string
  link: string
  author: string
}

export const parseVideosFeed = (
  channelId: string,
): TE.TaskEither<Error, readonly VideosFeedItem[]> =>
  pipe(
    TE.tryCatch(
      () =>
        videosFeedParser
          .parseURL(
            `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
          )
          .then(f => f.items.slice(0, 4) as VideosFeedItem[]),
      e => new Error(`${e}`),
    ),
  )

const _convertVideosFeedItem = (channelId: string, item: VideosFeedItem) => {
  return {
    id: item.id.replace(/yt:video:/, ""),
    title: item.title,
    channelId,
    publishedAt: new Date(item.pubDate),
  } as Video
}

export const convertVideosFeedItem =
  (channelId: string) => (item: VideosFeedItem) =>
    _convertVideosFeedItem(channelId, item)
