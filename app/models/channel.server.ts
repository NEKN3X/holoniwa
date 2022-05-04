import { db } from "~/db.server"
import { RA, S, TE } from "~/utils/fp-ts"
import { pipe } from "fp-ts/lib/function"
import type { Channel as _Channel, Prisma } from "@prisma/client"
import type { Immutable } from "immer"

export type Channel = Immutable<_Channel>

export const getChannel = (args: Prisma.ChannelFindUniqueArgs) =>
  pipe(
    TE.tryCatch(
      () =>
        db.channel.findUnique(args).then(TE.fromNullable("Channel not found")),
      () => "Error getting channel",
    ),
    TE.flatten,
  )

export const getChannels = (args: Prisma.ChannelFindManyArgs) =>
  pipe(
    TE.tryCatch(
      () => db.channel.findMany(args),
      () => "Error getting channels",
    ),
  )

export const upsertChannel = (args: Prisma.ChannelUpsertArgs) =>
  pipe(
    TE.tryCatch(
      () => db.channel.upsert(args),
      () => "Error upserting channel",
    ),
  )

export const channelsInText =
  (channels: readonly Pick<Channel, "id" | "title">[]) => (text: string) =>
    pipe(
      channels,
      RA.filter(c => S.includes(`@${c.title}`)(text) || S.includes(c.id)(text)),
      RA.map(c => c.id),
    )
