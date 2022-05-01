import { db } from "~/db.server"
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

// if (video.channelId === "UC3G2QylAJ8NN3_ZzrPV6vzg")
//   video.channelId = "UCp6993wxpyDPHUpavwDFqgg"
export const upsertVideo = (args: Prisma.VideoUpsertArgs) =>
  pipe(
    TE.tryCatch(
      () => db.video.upsert(args),
      e => new Error(`${e}`),
    ),
  )

export const deleteVideos = (args: Prisma.VideoDeleteManyArgs) =>
  pipe(
    TE.tryCatch(
      () => db.video.deleteMany(args),
      e => new Error(`${e}`),
    ),
  )
