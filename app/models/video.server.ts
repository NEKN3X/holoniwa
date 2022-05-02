import { db } from "~/db.server"
import { RA, TE } from "~/utils/fp-ts"
import { pipe } from "fp-ts/lib/function"
import type { Channel } from "./channel.server"
import type { Prisma, Video as _Video } from "@prisma/client"
import type { Immutable } from "immer"

export type Video = Immutable<_Video>

export const getVideo = (
  args: Prisma.VideoFindUniqueArgs,
): TE.TaskEither<unknown, Video> =>
  pipe(
    TE.tryCatch(
      () => db.video.findUnique(args).then(TE.fromNullable("Video not found")),
      e => e,
    ),
    TE.flatten,
  )

export const getVideos = (
  args: Prisma.VideoFindManyArgs,
): TE.TaskEither<unknown, readonly Video[]> =>
  pipe(
    TE.tryCatch(
      () => db.video.findMany(args),
      e => e,
    ),
  )

export const upsertVideo = (
  video: Video,
  colabs?: readonly Channel["id"][],
): TE.TaskEither<unknown, Video> => {
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
      e => e,
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
      e => e,
    ),
  )
