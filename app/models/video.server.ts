import { db } from "~/db.server"
import * as RA from "fp-ts/lib/ReadonlyArray"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import type { Channel, Prisma, Video } from "@prisma/client"

export type { Video } from "@prisma/client"
export type VideoWithRelations = Video & {
  Channel?: Channel
  Colabs?: {
    Channel: Channel
  }[]
}

export const getVideo = (
  args: Prisma.VideoFindUniqueArgs,
): TE.TaskEither<Error, VideoWithRelations> =>
  pipe(
    TE.tryCatch(
      () =>
        db.video
          .findUnique(args)
          .then(TE.fromNullable(new Error("Video not found"))),
      e => new Error(`${e}`),
    ),
    TE.flatten,
  )

export const getVideos = (
  args: Prisma.VideoFindManyArgs,
): TE.TaskEither<Error, readonly VideoWithRelations[]> =>
  pipe(
    TE.tryCatch(
      () => db.video.findMany(args),
      e => new Error(`${e}`),
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
      e => new Error(`${e}`),
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
      e => new Error(`${e}`),
    ),
  )
