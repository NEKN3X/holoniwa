import { youtube } from "./client"
import { E, RA, TE } from "~/utils/fp-ts"
import { pipe } from "fp-ts/lib/function"
import moment from "moment"
import type { Video } from "@prisma/client"
import type { youtube_v3 } from "googleapis"
import type { Immutable } from "immer"

export const convertYouTubeVideo = (
  item: Immutable<youtube_v3.Schema$Video>,
) => {
  const snippet = item.snippet!
  const status = item.status!
  const liveStreamingDetails = item.liveStreamingDetails
  const contentDetails = item.contentDetails!
  return E.tryCatch(
    () =>
      ({
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
      } as Video),
    e => e as string[],
  )
}

export const youtubeVideoList = (videoIds: readonly string[]) =>
  pipe(
    TE.tryCatch(
      () =>
        youtube.videos
          .list({
            id: RA.toArray(videoIds),
            part: [
              "snippet",
              "status",
              "liveStreamingDetails",
              "contentDetails",
            ],
            regionCode: "JP",
          })
          .then(r => r.data.items!),
      e => e as string[],
    ),
  )
