import { map } from "fp-ts/lib/Array"
import * as RA from "fp-ts/lib/ReadonlyArray"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import Parser from "rss-parser"
import type { Video } from "@prisma/client"

type VideosFeedItem = {
  title: string
  link: string
  author: string
  pubDate: string
  id: string
}

type VideosFeed = {
  url: string
  title: string
  link: string
  author: string
}

const videosFeedParser: Parser<VideosFeed, VideosFeedItem> = new Parser()

const parseVideosFeed = (
  channelId: string,
): TE.TaskEither<Error, VideosFeedItem[]> =>
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

const itemToVideo = (channelId: string, item: VideosFeedItem) =>
  ({
    id: item.id.replace(/yt:video:/, ""),
    title: item.title,
    channelId,
    publishedAt: new Date(item.pubDate),
  } as Video)

const curriedItemToVideo = (channelId: string) => (item: VideosFeedItem) =>
  itemToVideo(channelId, item)

const getChannelFeed = (channelId: string) =>
  pipe(parseVideosFeed(channelId), TE.map(map(curriedItemToVideo(channelId))))

export const getChannelsFeed = (channelIds: string[]) =>
  pipe(channelIds, map(getChannelFeed), TE.sequenceArray, TE.map(RA.flatten))
