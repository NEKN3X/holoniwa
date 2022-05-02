import { convertYouTubeChannel, youtubeChannelList } from "./channel"
import { convertYouTubeVideo, youtubeVideoList } from "./video"
import { E, RA, TE } from "~/utils/fp-ts"
import { flow, pipe } from "fp-ts/lib/function"

export const getYouTubeChannels = (channelIds: readonly string[]) =>
  pipe(
    RA.chunksOf(50)(channelIds),
    RA.map(youtubeChannelList),
    TE.sequenceArray,
    TE.map(
      flow(
        RA.flatten,
        RA.map(convertYouTubeChannel),
        E.sequenceArray,
        TE.fromEither,
      ),
    ),
    TE.flatten,
  )

export const getYouTubeVideos = (videoIds: readonly string[]) =>
  pipe(
    RA.chunksOf(50)(videoIds),
    RA.map(youtubeVideoList),
    TE.sequenceArray,
    TE.map(
      flow(
        RA.flatten,
        RA.map(convertYouTubeVideo),
        E.sequenceArray,
        TE.fromEither,
      ),
    ),
    TE.flatten,
  )
