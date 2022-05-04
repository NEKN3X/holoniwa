import { youtube } from "./client"
import { E, RA, TE } from "~/utils/fp-ts"
import { pipe } from "fp-ts/lib/function"
import type { Channel } from "@prisma/client"
import type { youtube_v3 } from "googleapis"
import type { Immutable } from "immer"

export const convertYouTubeChannel = (
  item: Immutable<youtube_v3.Schema$Channel>,
) => {
  const snippet = item.snippet!

  return E.tryCatch(
    () =>
      ({
        id: item.id,
        title: snippet.title,
        description: snippet.description,
        thumbnail: snippet.thumbnails!.high?.url,
        publishedAt: snippet.publishedAt && new Date(snippet.publishedAt),
      } as Channel),
    () => "Error converting YouTube channel",
  )
}

export const youtubeChannelList = (channelIds: readonly string[]) =>
  pipe(
    TE.tryCatch(
      () =>
        youtube.channels
          .list({
            id: RA.toArray(channelIds),
            part: ["snippet"],
          })
          .then(r => r.data.items!),
      () => "Error getting YouTube channels",
    ),
  )
