import { db } from "~/db.server"
import { channelsInText } from "~/utils/channel"
import {
  getYouTubeVideos,
  getVideosFeed,
  connectOrCreateCollaborators,
  createManyCollaborators,
} from "~/utils/video"
import { json } from "@remix-run/server-runtime"
import { difference, flatten, pluck, union, without } from "ramda"
import type { ActionFunction } from "@remix-run/server-runtime"

export const action: ActionFunction = async ({ request }) => {
  const auth = request.headers.get("Authorization")
  if (auth !== `Bearer ${process.env.API_KEY}`)
    return json({ error: "Unauthorized" }, 401)

  // チャンネルを取得
  const channels = await db.channel.findMany({
    select: {
      id: true,
      title: true,
    },
  })

  // feedを取得
  const channelIds = pluck("id", channels)
  const feedIds = await Promise.all(channelIds.map(getVideosFeed)).then(flatten)

  // feedのうち、dbに既にあるもの
  const existingIds = await db.video
    .findMany({
      where: { id: { in: feedIds } },
      select: { id: true },
    })
    .then(pluck("id"))

  // feedのうち、dbにないもの
  const newIds = difference(feedIds, existingIds)

  // DBからstatusがnoneでない動画を取得
  const currentIds = await db.video
    .findMany({
      where: {
        liveStatus: {
          not: "none",
        },
      },
      select: {
        id: true,
      },
    })
    .then(pluck("id"))

  // YouTubeAPIから動画情報を取得
  let updatingIds = union(newIds, currentIds)
  const moreCount =
    (Math.floor(updatingIds.length / 50) + 1) * 50 - updatingIds.length
  const moreIds = await db.video
    .findMany({
      where: { liveStatus: "none" },
      select: { id: true },
      take: moreCount,
      orderBy: {
        updatedAt: "asc",
      },
    })
    .then(pluck("id"))
  updatingIds = union(updatingIds, moreIds)
  const upsertingVideos = await getYouTubeVideos(updatingIds)
  const deletingIds = difference(updatingIds, pluck("id", upsertingVideos))

  // DBを更新
  const upserted = await Promise.all(
    upsertingVideos.map(video => {
      const collaborators = without(
        [
          video.channelId,
          "UCfrWoRGlawPQDQxxeIDRP0Q",
          "UCotXwY6s8pWmuWd_snKYjhg",
          "UCJFZiqLMntJufDCHc6bQixg",
        ],
        channelsInText(video.description || "")(channels),
      )
      return db.video.upsert({
        where: { id: video.id },
        create: {
          ...video,
          ...createManyCollaborators(collaborators),
        },
        update: {
          ...video,
          ...connectOrCreateCollaborators(video.id, collaborators),
        },
        select: {
          id: true,
        },
      })
    }),
  ).then(pluck("id"))
  const deleted = await db.video.deleteMany({
    where: { id: { in: deletingIds } },
  })

  return json({
    upserted: upserted,
    deleted: deleted.count,
  })
}
