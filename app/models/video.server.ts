import { db } from "~/db.server"
import moment from "moment"
import { map } from "ramda"
import type { Channel, Video } from "@prisma/client"

export type { Video } from "@prisma/client"

export type VideoWithChannel = Video & {
  channel: Channel | null
}

export const getVideo = ({ id }: Video) => db.video.findFirst({ where: { id } })
export const getExistingVideos = (ids: Video["id"][]) =>
  db.video.findMany({ where: { id: { in: ids } }, select: { id: true } })

export const getLiveVideoListItems = () =>
  db.video.findMany({
    where: {
      liveStatus: "live",
    },
    orderBy: { startAt: "asc" },
    include: {
      channel: true,
    },
  })

export const getUpcomingVideoListItems = () =>
  db.video.findMany({
    where: {
      AND: [
        {
          scheduledAt: {
            lte: moment().add(2, "weeks").toDate(),
          },
        },
        { liveStatus: "upcoming" },
      ],
    },
    orderBy: { scheduledAt: "asc" },
    include: {
      channel: true,
    },
  })

export const getCurrentVideoListItems = () =>
  db.video.findMany({
    where: {
      OR: [{ liveStatus: "live" }, { liveStatus: "upcoming" }],
    },
    select: { id: true },
  })

export const upsertVideo = (video: Omit<Video, "updatedAt">) => {
  if (video.channelId === "UC3G2QylAJ8NN3_ZzrPV6vzg")
    video.channelId = "UCp6993wxpyDPHUpavwDFqgg" // ときのそら
  return db.video.upsert({
    where: { id: video.id },
    create: video,
    update: video,
  })
}

export const upsertVideos = (videos: Omit<Video, "updatedAt">[]) =>
  Promise.all(map(upsertVideo, videos))

export const deleteVideos = (ids: string[]) =>
  db.video.deleteMany({ where: { id: { in: ids } } })
