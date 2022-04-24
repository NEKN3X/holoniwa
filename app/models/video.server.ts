import { allChannels } from "./channel.server"
import { db } from "~/db.server"
import { youtube } from "~/lib/youtube"
import { fetchYouTubeFeed } from "~/utils/fetchFeed"
import { log } from "~/utils/log"
import { nonNullable } from "~/utils/nonNullable"
import { ids } from "googleapis/build/src/apis/ids"
import moment from "moment"
import type { Video } from "@prisma/client"

const regexp = /yt:video:/

export const fetchFeed = (channelId: string) => {
  return fetchYouTubeFeed(channelId)
    .then((res) => {
      return res.items.map((item) => {
        return {
          id: `${item.id}`.replace(regexp, ""),
          channelId: channelId,
          title: item.title!,
          publishedAt: moment(item.pubDate!).add(9, "h").toDate(),
        } as Video
      })
    })
    .catch((err) => {
      return [] as Video[]
    })
}

export const fetchVideos = (videoIds: string[]) => {
  return youtube.videos
    .list({
      id: videoIds,
      part: ["snippet", "status", "liveStreamingDetails", "contentDetails"],
      regionCode: "JP",
    })
    .then((res) => res.data.items)
    .then((data) => {
      return data!.map((item) => {
        const snippet = item.snippet!
        const thumbnails = snippet.thumbnails!
        const thumbnail =
          thumbnails.maxres ||
          thumbnails.standard ||
          thumbnails.high ||
          thumbnails.medium
        const status = item.status!
        return {
          id: item.id,
          title: snippet.title,
          channelId: snippet.channelId,
          thumbnail: thumbnail?.url,
          liveStatus: snippet.liveBroadcastContent,
          uploadStatus: status.uploadStatus,
          privacyStatus: status.privacyStatus,
          publishedAt: snippet.publishedAt && new Date(snippet.publishedAt),
          scheduledAt:
            item.liveStreamingDetails?.scheduledStartTime &&
            moment(item.liveStreamingDetails.scheduledStartTime)
              .add(9, "h")
              .toDate(),
          startAt:
            item.liveStreamingDetails?.scheduledStartTime &&
            moment(item.liveStreamingDetails.scheduledStartTime)
              .add(9, "h")
              .toDate(),
          endAt:
            item.liveStreamingDetails?.actualEndTime &&
            moment(item.liveStreamingDetails.actualEndTime)
              .add(9, "h")
              .toDate(),
          duration:
            item.contentDetails?.duration &&
            moment.duration(item.contentDetails.duration).asSeconds(),
        } as Video
      })
    })
    .catch((err) => {
      log(err)
      return [] as Video[]
    })
}

export const updateVideos = () => {
  const feeds = allChannels()
    .then((channels) => channels.map((channel) => fetchFeed(channel.id)))
    .then((feeds) => Promise.all(feeds))
  const feedIds = feeds.then((feeds) => feeds.flat().map((item) => item.id))

  const existing = feedIds.then((ids) =>
    Promise.all(
      ids.map((id) =>
        db.video.findUnique({ where: { id } }).then((video) => video),
      ),
    ).then((videos) => videos.filter(nonNullable)),
  )
  const newFeedIds = existing
    .then((videos) => videos.map((video) => video.id))
    .then((existing) =>
      feedIds.then((ids) => ids.filter((id) => !existing.includes(id))),
    )
  const currentFeedIds = db.video
    .findMany({ where: { NOT: { liveStatus: "none" } } })
    .then((current) => current.map((video) => video.id))

  const updating = currentFeedIds.then((ids) =>
    newFeedIds
      .then((newIds) => ids.concat(newIds))
      .then((ids) => {
        const taking = 50 - ids.length
        return taking < 0
          ? ids
          : db.video
              .findMany({ take: taking, orderBy: { updatedAt: "asc" } })
              .then((vidoes) => ids.concat(vidoes.map((video) => video.id)))
      })
      .then((ids) => ids.slice(0, 50)),
  )

  const updated = updating.then((ids) => fetchVideos(ids))

  const deleting = updating.then((older) =>
    updated
      .then((updated) => updated.map((video) => video.id))
      .then((updated) => older.filter((id) => !updated.includes(id))),
  )

  const upserted = updated.then((videos) => {
    const query = videos.map((video) =>
      db.video.upsert({
        where: { id: video.id },
        create: { ...video, updatedAt: moment().add(9, "h").toDate() },
        update: { ...video, updatedAt: moment().add(9, "h").toDate() },
      }),
    )
    return Promise.all(query)
  })

  const deleted = deleting.then((ids) =>
    ids.length > 0
      ? Promise.all(ids.map((id) => db.video.delete({ where: { id } })))
      : ([] as Video[]),
  )

  Promise.resolve(deleted).then((res) => console.log(`deleted: ${res.length}`))

  return Promise.resolve(upserted)
}
