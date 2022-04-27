import { fetchChannelFeed } from "./feed"
import { fetchYoutubeVideos } from "./youtube"
import { getAllChannels } from "../channel"
import { db } from "~/db.server"
import { flatten, includes, map, pluck, reject, take, union, __ } from "ramda"
import type { Video } from "@prisma/client"

export const updateVideos = async () => {
  const channels = await getAllChannels()
  const channelIds = pluck("id")(channels)
  const feeds = await Promise.all(map(fetchChannelFeed)(channelIds))
  const feedIds = pluck("id")(flatten(feeds))
  const existing = await db.video.findMany({
    where: { id: { in: feedIds } },
    select: { id: true },
  })
  const exIds = pluck("id")(existing)
  const newIds = reject(includes(__, exIds), feedIds)
  console.log(`new: ${newIds.length}`)

  const current = await db.video
    .findMany({
      where: { NOT: { liveStatus: "none" } },
      select: { id: true },
    })
    .then(r => r)
  const curIds = pluck("id")(current)
  const updIds = take(50, union(newIds, curIds))

  const fetched = await fetchYoutubeVideos(updIds)
  const fetIds = pluck("id")(fetched)
  const delIds = reject(includes(__, fetIds), updIds)

  const upsert = (video: Video) =>
    db.video
      .upsert({
        where: { id: video.id },
        create: video,
        update: video,
      })
      .then(r => r)
  const upserted = await Promise.all(map(upsert, fetched))
  console.log(`upserted: ${upserted.length}`)

  const del = (id: string) =>
    db.video.delete({ where: { id }, select: { id: true } }).then(r => r)
  const deleted = await Promise.all(map(del, delIds))
  console.log(`deleted: ${deleted.length}`)

  return upserted
}
