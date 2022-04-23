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
      log(err)
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
        const liveStreamingDetails = item.liveStreamingDetails!
        const contentDetails = item.contentDetails!
        return {
          id: item.id,
          title: snippet.title,
          channelId: snippet.channelId,
          thumbnail: thumbnail,
          liveStatus: snippet.liveBroadcastContent,
          uploadStatus: status.uploadStatus,
          privacyStatus: status.privacyStatus,
          publishedAt: snippet.publishedAt && new Date(snippet.publishedAt),
          scheduledAt:
            liveStreamingDetails.scheduledStartTime &&
            new Date(liveStreamingDetails.scheduledStartTime),
          startAt:
            liveStreamingDetails.scheduledStartTime &&
            new Date(liveStreamingDetails.scheduledStartTime),
          endAt:
            liveStreamingDetails.actualEndTime &&
            new Date(liveStreamingDetails.actualEndTime),
          duration:
            contentDetails.duration &&
            moment.duration(contentDetails.duration).asSeconds(),
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
  log(existing)
  // const existingIds = existing.then((videos) => videos.map((video) => video.id))
  // const newFeed = existing.then((existing) =>
  //   updating.then((ids) => ids.filter((id) => !existing.includes(id))),
  // )
  // const currentFeed = existing.then((existing) => existing.filter())
}
