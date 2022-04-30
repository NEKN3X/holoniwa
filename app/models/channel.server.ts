import { db } from "~/db.server"
import type { Channel } from "@prisma/client"

export type { Channel } from "@prisma/client"

export const getChannel = ({ id }: Channel) =>
  db.channel.findFirst({ where: { id } })

export const getAllChannelIds = () =>
  db.channel.findMany({ select: { id: true } })

export const upsertChannel = (channel: Channel) =>
  db.channel.upsert({
    where: { id: channel.id },
    create: channel,
    update: channel,
  })
