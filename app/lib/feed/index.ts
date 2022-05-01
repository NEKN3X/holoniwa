import { convertVideosFeedItem, parseVideosFeed } from "./video"
import * as RA from "fp-ts/lib/ReadonlyArray"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"

export const getVideosFeed = (channelId: string) =>
  pipe(
    channelId,
    parseVideosFeed,
    TE.map(RA.map(convertVideosFeedItem(channelId))),
  )

export const getVideosFeeds = (channelIds: readonly string[]) =>
  pipe(channelIds, RA.map(getVideosFeed), TE.sequenceArray, TE.map(RA.flatten))
