import { db } from "~/db.server"
import { RA, S, TE } from "~/utils/fp-ts"
import { pipe } from "fp-ts/lib/function"
import type { Channel as _Channel, Prisma } from "@prisma/client"
import type { Immutable } from "immer"

export type Channel = Immutable<_Channel>

export const getChannel = (
  args: Prisma.ChannelFindUniqueArgs,
): TE.TaskEither<Error, Channel> =>
  pipe(
    TE.tryCatch(
      () =>
        db.channel
          .findUnique(args)
          .then(TE.fromNullable(new Error("Channel not found"))),
      e => new Error(`Failed to get channel`),
    ),
    TE.flatten,
  )

export const getChannels = (
  args: Prisma.ChannelFindManyArgs,
): TE.TaskEither<Error, readonly Channel[]> =>
  pipe(
    TE.tryCatch(
      () =>
        db.channel
          .findMany(args)
          .then(TE.fromNullable(new Error("Channel not found"))),
      e => new Error(`Failed to get channels`),
    ),
    TE.flatten,
  )

export const upsertChannel = (
  args: Prisma.ChannelUpsertArgs,
): TE.TaskEither<Error, Channel> =>
  pipe(
    TE.tryCatch(
      () =>
        db.channel
          .upsert(args)
          .then(TE.fromNullable(new Error("Channel not found"))),
      e => new Error(`Failed to upsert channel`),
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
