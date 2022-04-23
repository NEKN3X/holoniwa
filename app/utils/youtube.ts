import { google } from "googleapis"
import moment from "moment"
import type { Video } from "@prisma/client"

const API_ROOT = "https://www.googleapis.com/youtube/v3"
const API_KEY = process.env?.YOUTUBE_API_KEY ?? ""

const youtube = google.youtube({
  version: "v3",
  auth: API_KEY,
})

export const YouTubeURL = (url: string) => {
  return new URL(`${API_ROOT}/${url}?key=${API_KEY}`)
}
export const getYouTubeVideos = async (vids: string[]) => {
  const data = await youtube.videos
    .list({
      id: vids,
      part: ["snippet", "status", "liveStreamingDetails", "contentDetails"],
      regionCode: "JP",
    })
    .then((data) => data.data)
  if (!data.items) throw new Error("No items")
  const videos: Video[] = data.items.map((item) => {
    if (!item.snippet) throw new Error("No snippet")
    const snippet = item.snippet
    const thumbnail =
      snippet.thumbnails?.maxres?.url ||
      snippet.thumbnails?.standard?.url ||
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url
    return {
      id: item.id!,
      title: item.snippet.title!,
      channelId: item.snippet.channelId!,
      thumbnail: thumbnail!,
      liveStatus: item.snippet.liveBroadcastContent!,
      uploadStatus: item.status?.uploadStatus!,
      privacyStatus: item.status?.privacyStatus!,
      publishedAt: new Date(item.snippet.publishedAt!),
      scheduledAt: new Date(item.liveStreamingDetails?.scheduledStartTime!),
      startAt: new Date(item.liveStreamingDetails?.scheduledStartTime!),
      endAt: new Date(item.liveStreamingDetails?.actualEndTime!),
      duration: moment.duration(item.contentDetails?.duration!).asSeconds(),
    }
  })
  return videos
}
