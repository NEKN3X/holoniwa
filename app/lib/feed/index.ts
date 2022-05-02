import { convertVideosFeedItem, parseVideosFeed } from "./video"
import { RA, TE } from "~/utils/fp-ts"
import { pipe } from "fp-ts/lib/function"

export const getVideosFeed = (channelId: string) =>
  pipe(
    channelId,
    parseVideosFeed,
    TE.map(RA.map(convertVideosFeedItem(channelId))),
  )

export const getVideosFeeds = (channelIds: readonly string[]) =>
  pipe(channelIds, RA.map(getVideosFeed), TE.sequenceArray, TE.map(RA.flatten))
