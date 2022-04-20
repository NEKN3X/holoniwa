import moment from "moment"
import type { Video } from "@prisma/client"

const API_ROOT = "https://www.googleapis.com/youtube/v3"
const API_KEY = process.env?.YOUTUBE_API_KEY ?? ""

export const YouTubeURL = (url: string) => {
  return new URL(`${API_ROOT}/${url}?key=${API_KEY}`)
}

export const getYouTubeVideos = async (vids: string) => {
  const url = YouTubeURL("videos").toString()
  const items = await fetch(
    `${url}&part=snippet,status,liveStreamingDetails,contentDetails&id=${vids}`,
  )
    .then((res) => res.json())
    .then((data) => data.items)
  const videos: Video[] = items.map((item: any) => {
    const thumbnails = item.snippet.thumbnails
    const thumbnail =
      thumbnails.maxres ||
      thumbnails.standard ||
      thumbnails.high ||
      thumbnails.medium ||
      thumbnails.default
    return {
      id: item.id,
      title: item.snippet.title,
      channelId: item.snippet.channelId,
      thumbnail: thumbnail.url,
      liveStatus: item.snippet.liveBroadcastContent,
      uploadStatus: item.status.uploadStatus,
      privacyStatus: item.status.privacyStatus,
      publishedAt: new Date(item.snippet.publishedAt),
      scheduledAt: new Date(item.liveStreamingDetails?.scheduledStartTime),
      startAt: new Date(item.liveStreamingDetails?.scheduledStartTime),
      endAt: new Date(item.liveStreamingDetails?.actualEndTime),
      duration: moment.duration(item.contentDetails.duration).asSeconds(),
    }
  })
  return videos
}
