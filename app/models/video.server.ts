import { db } from "~/db.server"
import { RA, TE } from "~/utils/fp-ts"
import { pipe } from "fp-ts/lib/function"
import type { Channel } from "./channel.server"
import type { Prisma, Video as _Video } from "@prisma/client"
import type { Immutable } from "immer"

export type Video = Immutable<
  _Video & {
    Channel?: Channel
    Collaborations?: {
      Channel: Channel
    }[]
  }
>

export const getVideo = (args: Prisma.VideoFindUniqueArgs) =>
  pipe(
    TE.tryCatch(
      () =>
        db.video.findUnique(args).then(TE.fromNullable(["Video not found"])),
      e => e as string[],
    ),
    TE.flatten,
  )

export const getVideos = (args: Prisma.VideoFindManyArgs) =>
  pipe(
    TE.tryCatch(
      () => db.video.findMany(args),
      e => e as string[],
    ),
  )

export const upsertVideo = (
  video: _Video,
  collaborators?: readonly Channel["id"][],
) => {
  const withCreateCollaborations = collaborators && {
    Collaborations: {
      createMany: {
        data: collaborators.map(c => ({ channelId: c })),
      },
    },
  }
  const withUpdateCollaborations = collaborators && {
    Collaborations: {
      connectOrCreate: collaborators.map(c => ({
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
            ...withCreateCollaborations,
          },
          update: {
            ...video,
            ...withUpdateCollaborations,
          },
        }),
      e => e as string[],
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
      e => e as string[],
    ),
  )
