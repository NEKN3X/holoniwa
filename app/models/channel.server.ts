import { db } from "~/db.server"
import { filter, test } from "ramda"
import type { Channel } from "@prisma/client"

export type { Channel } from "@prisma/client"

export const getChannel = ({ id }: Channel) =>
  db.channel.findFirst({ where: { id } })

export const getAllChannels = () => db.channel.findMany()

export const getChannels = (ids: string[]) =>
  db.channel.findMany({
    where: { id: { in: ids } },
  })

export const getAllChannelIds = () =>
  db.channel.findMany({ select: { id: true } })

export const upsertChannel = (channel: Channel) =>
  db.channel.upsert({
    where: { id: channel.id },
    create: channel,
    update: channel,
  })

const testTitle = (text: string) => (target: { id: string; title: string }) =>
  test(RegExp(`@${target.title}`), text)

export const channelsInText = (text: string, channels: Channel[]) => {
  return filter(testTitle(text))(channels)
}
