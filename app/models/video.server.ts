import { allChannels } from "./channel.server"
import { db } from "~/db.server"
import { youtube } from "~/lib/youtube"
import { fetchYouTubeFeed } from "~/utils/fetchFeed"
import { log } from "~/utils/log"
import { nonNullable } from "~/utils/nonNullable"
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
          publishedAt: new Date(item.pubDate!),
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
            new Date(item.liveStreamingDetails.scheduledStartTime),
          startAt:
            item.liveStreamingDetails?.scheduledStartTime &&
            new Date(item.liveStreamingDetails.scheduledStartTime),
          endAt:
            item.liveStreamingDetails?.actualEndTime &&
            new Date(item.liveStreamingDetails.actualEndTime),
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
  const currentFeedIds = existing.then((existing) =>
    existing
      .filter((video) => video.liveStatus !== "none")
      .map((video) => video.id),
  )

  const updating = currentFeedIds.then((ids) =>
    newFeedIds
      .then((newIds) => ids.concat(newIds))
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
        create: video,
        update: video,
      }),
    )
    return Promise.all(query)
  })

  const deleted = deleting.then((ids) =>
    ids.length == 0
      ? Promise.all(ids.map((id) => db.video.delete({ where: { id } })))
      : ([] as Video[]),
  )

  Promise.resolve(upserted).then((res) =>
    console.log(`upserted: ${res.length}`),
  )
  Promise.resolve(deleted).then((res) => console.log(`deleted: ${res.length}`))
}
