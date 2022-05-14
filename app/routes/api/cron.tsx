import { db } from "~/db.server"
import { getVideosFeeds } from "~/lib/feed"
import { getYouTubeVideos } from "~/lib/youtube"
import { channelsInText } from "~/models/channel.server"
import { json } from "@remix-run/server-runtime"
import { difference, flatten, map, pluck, union } from "ramda"
import type { ActionFunction } from "@remix-run/server-runtime"

export const action: ActionFunction = async ({ request }) => {
  const auth = request.headers.get("Authorization")
  if (auth !== `Bearer ${process.env.API_KEY}`)
    return json({ error: "Unauthorized" }, 401)

  // チャンネルを取得
  const channels = await db.channel.findMany({
    where: {
      archived: false,
    },
    select: {
      id: true,
      title: true,
    },
  })

  // feedを取得
  const feedIds = await Promise.all(getVideosFeeds(pluck("id", channels)))
    .then(feeds => feeds.flat())
    .then(pluck("id"))

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
  const _updatingIds = union(newIds, currentIds)
  const moreCount =
    (Math.floor(_updatingIds.length / 50) + 1) * 50 - _updatingIds.length
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
  const updatingIds = union(_updatingIds, moreIds)
  const upsertingVideos = await Promise.all(getYouTubeVideos(updatingIds)).then(
    flatten,
  )
  const deletingIds = difference(updatingIds, pluck("id", upsertingVideos))

  // DBを更新
  const upserted = await Promise.all(
    map(video => {
      const collaborators = channelsInText(channels)(video.description || "")
      return db.video.upsert({
        where: { id: video.id },
        create: {
          ...video,
          Collaborations: {
            createMany: {
              data: collaborators.map(({ id }) => ({ channelId: id })),
            },
          },
        },
        update: {
          ...video,
          Collaborations: {
            connectOrCreate: collaborators.map(({ id }) => ({
              where: {
                videoId_channelId: {
                  videoId: video.id,
                  channelId: id,
                },
              },
              create: {
                channelId: id,
              },
            })),
          },
        },
      })
    }, upsertingVideos),
  )
  const deleted = await db.video.deleteMany({
    where: { id: { in: deletingIds } },
  })

  return json({
    upserted: upserted.length,
    deleted: deleted.count,
  })
}
