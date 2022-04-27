import { youtube } from "~/lib/youtube"
import moment from "moment"
import { map } from "ramda"
import type { Video } from "@prisma/client"

export const fetchYoutubeVideos = (videoIds: string[]) =>
  youtube.videos
    .list({
      id: videoIds, // TODO: 50ごとに分割する
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
