import { youtube } from "./client"
import * as E from "fp-ts/lib/Either"
import * as RA from "fp-ts/lib/ReadonlyArray"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import type { Channel } from "@prisma/client"
import type { youtube_v3 } from "googleapis"

export const convertYouTubeChannel = (item: youtube_v3.Schema$Channel) => {
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
    e => new Error(`${e}`),
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
      e => new Error(`${e}`),
    ),
  )
