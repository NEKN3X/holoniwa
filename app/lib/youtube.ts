import { google } from "googleapis"
import moment from "moment"
import { drop, map, take } from "ramda"
import type { Video } from "@prisma/client"

const API_KEY = process.env.YOUTUBE_API_KEY ?? ""

export const youtube = google.youtube({
  version: "v3",
  auth: API_KEY,
})

const youtubeVideos = async (videoIds: string[]) =>
  youtube.videos
    .list({
      id: videoIds,
      part: ["snippet", "status", "liveStreamingDetails", "contentDetails"],
      regionCode: "JP",
    })
    .then(r => r.data.items!)
    .then(
      map(
        i =>
          ({
            id: i.id!,
            title: i.snippet!.title,
            channelId: i.snippet!.channelId,
            thumbnail: i.snippet!.thumbnails!.high?.url,
            description: i.snippet!.description,
            liveStatus: i.snippet!.liveBroadcastContent,
            uploadStatus: i.status!.uploadStatus,
            privacyStatus: i.status!.privacyStatus,
            publishedAt:
              i.snippet!.publishedAt && new Date(i.snippet!.publishedAt),
            scheduledAt:
              i.liveStreamingDetails?.scheduledStartTime &&
              new Date(i.liveStreamingDetails.scheduledStartTime),
            startAt:
              i.liveStreamingDetails?.actualStartTime &&
              new Date(i.liveStreamingDetails.actualStartTime),
            endAt:
              i.liveStreamingDetails?.actualEndTime &&
              new Date(i.liveStreamingDetails.actualEndTime),
            duration:
              i.contentDetails?.duration &&
              moment.duration(i.contentDetails.duration).asSeconds(),
          } as Video),
      ),
    )

export const getYouTubeVideos = (videoIds: string[]) => {
  const data: Promise<Video[]>[] = []
  data.push(youtubeVideos(take(50, videoIds)))
  const next = drop(50, videoIds)
  if (next.length > 0) {
    data.push(...getYouTubeVideos(next))
  }
  return data
}
