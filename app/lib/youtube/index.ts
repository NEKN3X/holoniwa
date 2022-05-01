import { convertYouTubeChannel, youtubeChannelList } from "./channel"
import { convertYouTubeVideo, youtubeVideoList } from "./video"
import * as E from "fp-ts/lib/Either"
import * as RA from "fp-ts/lib/ReadonlyArray"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"

export const getYouTubeChannels = (channelIds: readonly string[]) =>
  pipe(
    RA.map(youtubeChannelList)(RA.chunksOf(50)(channelIds)),
    TE.sequenceArray,
    TE.map(RA.flatten),
    TE.map(RA.map(convertYouTubeChannel)),
    TE.map(E.sequenceArray),
    TE.map(TE.fromEither),
    TE.flatten,
  )

export const getYouTubeVideos = (videoIds: readonly string[]) =>
  pipe(
    RA.map(youtubeVideoList)(RA.chunksOf(50)(videoIds)),
    TE.sequenceArray,
    TE.map(RA.flatten),
    TE.map(RA.map(convertYouTubeVideo)),
    TE.map(E.sequenceArray),
    TE.map(TE.fromEither),
    TE.flatten,
  )
