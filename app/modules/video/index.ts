import { fetchChannelFeeds } from "./feed"
import { fetchYoutubeVideos } from "./youtube"
import { getAllChannels } from "../channel"
import { db } from "~/db.server"
import {
  assoc,
  concat,
  difference,
  equals,
  filter,
  includes,
  map,
  pluck,
  prop,
  reject,
  take,
  union,
  __,
} from "ramda"
import type { Channel, Video } from "@prisma/client"

export const upsert = (video: Video) =>
  db.video.upsert({
    where: { id: video.id },
    create: video,
    update: video,
  })

export const upsertMany = (videos: Video[]) => Promise.all(map(upsert, videos))

export const deleteMany = (ids: string[]) =>
  db.video.deleteMany({ where: { id: { in: ids } } }).then(r => r.count)

const titleInText = (text: string) => (channel: Channel) =>
  includes(__, text)(concat("@", prop("title", channel)))

const colabs = (channels: Channel[], text: string) =>
  filter(titleInText(text))(channels)

export const updateVideos = async () => {
  const channels = await getAllChannels()
  const channelIds = pluck("id")(channels)
  const feeds = await fetchChannelFeeds(channelIds)
  const feedIds = pluck("id")(feeds)
  const existing = await db.video.findMany({
    where: { id: { in: feedIds } },
    select: { id: true },
  })
  const exIds = pluck("id")(existing)
  const newIds = difference(feedIds, exIds)
  console.log(`new: ${newIds.length}`)

  const current = await db.video.findMany({
    where: { NOT: { liveStatus: "none" } },
    select: { id: true },
  })
  const curIds = pluck("id")(current)
  const uniIds = union(newIds, curIds)
  const more = await db.video.findMany({
    take: uniIds.length > 50 ? 0 : 50 - uniIds.length,
    select: { id: true },
    orderBy: { updatedAt: "asc" },
  })
  const morIds = pluck("id")(more)
  const updIds = take(50, union(uniIds, morIds))

  const fetched = await fetchYoutubeVideos(updIds)
  const fetIds = pluck("id")(fetched)
  const delIds = difference(updIds, fetIds)

  const chackColabs = (text: string) => colabs(channels, text)
  const withColabs = (video: Video) =>
    assoc(
      "colabIds",
      reject(equals(video.id), pluck("id", chackColabs(video.description!))),
      video,
    )

  const upserted = await upsertMany(map(withColabs, fetched))
  console.log(`cur: ${curIds.length}`)
  console.log(`old: ${morIds.length}`)
  console.log(`upd: ${updIds.length}`)

  const deleted = await deleteMany(delIds)
  console.log(`del: ${deleted}`)

  return upserted
}
