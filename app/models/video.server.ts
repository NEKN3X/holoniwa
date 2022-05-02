import { db } from "~/db.server"
import { RA, TE } from "~/utils/fp-ts"
import { pipe } from "fp-ts/lib/function"
import type { Channel } from "./channel.server"
import type { Prisma, Video as _Video } from "@prisma/client"
import type { Immutable } from "immer"

export type Video = Immutable<_Video>

export const getVideo = (
  args: Prisma.VideoFindUniqueArgs,
): TE.TaskEither<Error, Video> =>
  pipe(
    TE.tryCatch(
      () =>
        db.video
          .findUnique(args)
          .then(TE.fromNullable(new Error("Video not found"))),
      e => new Error(`Failed to get video`),
    ),
    TE.flatten,
  )

export const getVideos = (
  args: Prisma.VideoFindManyArgs,
): TE.TaskEither<Error, readonly Video[]> =>
  pipe(
    TE.tryCatch(
      () => db.video.findMany(args),
      e => new Error(`Failed to get videos`),
    ),
  )

export const upsertVideo = (
  video: Video,
  colabs?: readonly Channel["id"][],
) => {
  const withCreateColabs = colabs && {
    Colabs: {
      createMany: {
        data: colabs.map(c => ({ channelId: c })),
      },
    },
  }
  const withUpdateColabs = colabs && {
    Colabs: {
      connectOrCreate: colabs.map(c => ({
        where: {
          videoId_channelId: {
            videoId: video.id,
            channelId: c,
          },
        },
        create: {
          channelId: c,
        },
      })),
    },
  }
  return pipe(
    TE.tryCatch(
      () =>
        db.video.upsert({
          where: { id: video.id },
          create: {
            ...video,
            ...withCreateColabs,
          },
          update: {
            ...video,
            ...withUpdateColabs,
          },
        }),
      e => new Error(`Failed to upsert video`),
    ),
  )
}

export const deleteVideos = (videoIds: readonly Video["id"][]) =>
  pipe(
    TE.tryCatch(
      () =>
        db.video.deleteMany({
          where: { id: { in: RA.toArray(videoIds) } },
        }),
      e => new Error(`Failed to delete videos`),
    ),
  )
