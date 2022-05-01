import * as E from "fp-ts/lib/Either"
import * as RA from "fp-ts/lib/ReadonlyArray"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import { google } from "googleapis"
import moment from "moment"
import type { Video } from "@prisma/client"
import type { youtube_v3 } from "googleapis"

const API_KEY = process.env.YOUTUBE_API_KEY ?? ""

const youtube = google.youtube({
  version: "v3",
  auth: API_KEY,
})

const convertYouTubeVideo = (item: youtube_v3.Schema$Video) => {
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
    e => new Error(`${e}`),
  )
}

const youtubeVideosList = (videoIds: readonly string[]) =>
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
      e => new Error(`${e}`),
    ),
    TE.map(RA.map(convertYouTubeVideo)),
    TE.map(E.sequenceArray),
    TE.map(TE.fromEither),
    TE.flatten,
  )

export const getYouTubeVideos = (videoIds: readonly string[]) =>
  pipe(
    RA.map(youtubeVideosList)(RA.chunksOf(50)(videoIds)),
    TE.sequenceArray,
    TE.map(RA.flatten),
  )
