import { db } from "~/db.server"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import type { Channel, Prisma, Video } from "@prisma/client"

export type { Channel } from "@prisma/client"
export type ChannelWithRelations = Channel & {
  Videos?: Video[]
}

export const getChannel = (
  args: Prisma.ChannelFindUniqueArgs,
): TE.TaskEither<Error, ChannelWithRelations> =>
  pipe(
    TE.tryCatch(
      () =>
        db.channel
          .findUnique(args)
          .then(TE.fromNullable(new Error("Channel not found"))),
      e => new Error(`${e}`),
    ),
    TE.flatten,
  )

export const getChannels = (
  args: Prisma.ChannelFindManyArgs,
): TE.TaskEither<Error, readonly ChannelWithRelations[]> =>
  pipe(
    TE.tryCatch(
      () =>
        db.channel
          .findMany(args)
          .then(TE.fromNullable(new Error("Channel not found"))),
      e => new Error(`${e}`),
    ),
    TE.flatten,
  )

export const upsertChannel = (
  args: Prisma.ChannelUpsertArgs,
): TE.TaskEither<Error, ChannelWithRelations> =>
  pipe(
    TE.tryCatch(
      () =>
        db.channel
          .upsert(args)
          .then(TE.fromNullable(new Error("Channel not found"))),
      e => new Error(`${e}`),
    ),
    TE.flatten,
  )
