import { youtube } from "~/utils/youtube"
import moment from "moment"
import type { Video } from "@prisma/client"
import type { youtube_v3 } from "googleapis"

const toDomainVideo = (
  item: youtube_v3.Schema$Video,
): Omit<Video, "updatedAt"> => {
  const snippet = item.snippet!
  const status = item.status!
  const liveStreamingDetails = item.liveStreamingDetails
  const contentDetails = item.contentDetails!
  return {
    id: item.id!,
    title: snippet.title!,
    channelId: snippet.channelId!,
    thumbnail: snippet.thumbnails!.high?.url!,
    description: snippet.description!,
    liveStatus: snippet.liveBroadcastContent!,
    uploadStatus: status.uploadStatus!,
    privacyStatus: status.privacyStatus!,
    publishedAt: new Date(snippet.publishedAt!),
    scheduledAt: liveStreamingDetails?.scheduledStartTime
      ? new Date(liveStreamingDetails.scheduledStartTime)
      : null,
    startAt: liveStreamingDetails?.actualStartTime
      ? new Date(liveStreamingDetails.actualStartTime)
      : null,
    endAt: liveStreamingDetails?.actualEndTime
      ? new Date(liveStreamingDetails.actualEndTime)
      : null,
    duration: contentDetails?.duration
      ? moment.duration(contentDetails.duration).asSeconds()
      : null,
  }
}

export const youtubeVideosList = (videoIds: string[]) =>
  youtube.videos
    .list({
      id: videoIds,
      part: ["snippet", "status", "liveStreamingDetails", "contentDetails"],
      regionCode: "JP",
    })
    .then(r => r.data.items!)
    .then(items => items.map(toDomainVideo))
