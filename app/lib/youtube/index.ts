import { convertYouTubeChannel, youtubeChannelList } from "./channel"
import { convertYouTubeVideo, youtubeVideoList } from "./video"
import { E, RA, TE } from "~/utils/fp-ts"
import { flow, pipe } from "fp-ts/lib/function"

export const getYouTubeChannels = (channelIds: readonly string[]) =>
  pipe(
    RA.chunksOf(50)(channelIds),
    TE.traverseArray(youtubeChannelList),
    TE.chain(
      flow(RA.flatten, E.traverseArray(convertYouTubeChannel), TE.fromEither),
    ),
  )

export const getYouTubeVideos = (videoIds: readonly string[]) =>
  pipe(
    RA.chunksOf(50)(videoIds),
    TE.traverseArray(youtubeVideoList),
    TE.chain(
      flow(RA.flatten, E.traverseArray(convertYouTubeVideo), TE.fromEither),
    ),
  )
