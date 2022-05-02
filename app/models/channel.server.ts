import { db } from "~/db.server"
import * as RA from "fp-ts/lib/ReadonlyArray"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import * as S from "fp-ts/lib/string"
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

export const channelsInText =
  (channels: readonly Pick<Channel, "id" | "title">[]) => (text: string) =>
    pipe(
      channels,
      RA.filter(c => S.includes(`@${c.title}`)(text) || S.includes(c.id)(text)),
      RA.map(c => c.id),
    )
