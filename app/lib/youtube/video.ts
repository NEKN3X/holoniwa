import { youtube } from "./client"
import moment from "moment"
import { map } from "ramda"
import type { Video } from "@prisma/client"
import type { youtube_v3 } from "googleapis"

const convertYouTubeVideo = (item: youtube_v3.Schema$Video) => {
  const snippet = item.snippet!
  const status = item.status!
  const liveStreamingDetails = item.liveStreamingDetails
  const contentDetails = item.contentDetails!
  return {
    id: item.id,
    title: snippet.title,
    channelId: snippet.channelId,
    thumbnail: snippet.thumbnails!.high?.url,
    description: snippet.description,
    liveStatus: snippet.liveBroadcastContent,
    uploadStatus: status.uploadStatus,
    privacyStatus: status.privacyStatus,
    publishedAt: snippet.publishedAt && new Date(snippet.publishedAt),
    scheduledAt:
      liveStreamingDetails?.scheduledStartTime &&
      new Date(liveStreamingDetails.scheduledStartTime),
    startAt:
      liveStreamingDetails?.actualStartTime &&
      new Date(liveStreamingDetails.actualStartTime),
    endAt:
      liveStreamingDetails?.actualEndTime &&
      new Date(liveStreamingDetails.actualEndTime),
    duration:
      contentDetails?.duration &&
      moment.duration(contentDetails.duration).asSeconds(),
  } as Video
}

export const youtubeVideoList = (videoIds: string[]) =>
  youtube.videos
    .list({
      id: videoIds,
      part: ["snippet", "status", "liveStreamingDetails", "contentDetails"],
      regionCode: "JP",
    })
    .then(r => r.data.items!)
    .then(map(convertYouTubeVideo))
