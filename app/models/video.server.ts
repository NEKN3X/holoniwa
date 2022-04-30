import { channelsInText, getAllChannels } from "./channel.server"
import { db } from "~/db.server"
import moment from "moment"
import { map } from "ramda"
import type { Channel, Colab, Video } from "@prisma/client"

export type { Video } from "@prisma/client"
export type VideoWithRelations = Video & {
  Channel: Channel
  Colabs: {
    Channel: Channel
  }[]
}

export const getVideo = ({ id }: Video) => db.video.findFirst({ where: { id } })
export const getExistingVideos = (ids: Video["id"][]) =>
  db.video.findMany({ where: { id: { in: ids } }, select: { id: true } })

export const getLiveVideoListItems = () =>
  db.video.findMany({
    where: {
      liveStatus: "live",
    },
    orderBy: { startAt: "desc" },
    include: {
      Channel: true,
      Colabs: {
        select: {
          Channel: true,
        },
      },
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
      Channel: true,
      Colabs: {
        select: {
          Channel: true,
        },
      },
    },
  })

export const getRecentVideoListItems = () =>
  db.video.findMany({
    where: {
      liveStatus: "none",
      startAt: {
        gte: moment().subtract(1, "day").toDate(),
      },
    },
    orderBy: { startAt: "desc" },
    include: {
      Channel: true,
      Colabs: {
        select: {
          Channel: true,
        },
      },
    },
  })

export const getCurrentVideoListItems = () =>
  db.video.findMany({
    where: {
      OR: [{ liveStatus: "live" }, { liveStatus: "upcoming" }],
    },
    select: { id: true },
  })

export const upsertVideo = async (
  video: Omit<Video, "updatedAt">,
  colabs?: Channel[],
) => {
  if (video.channelId === "UC3G2QylAJ8NN3_ZzrPV6vzg")
    video.channelId = "UCp6993wxpyDPHUpavwDFqgg" // ときのそら
  return db.video.upsert({
    where: { id: video.id },
    create: {
      ...video,
      Colabs: {
        create: colabs?.map(c => ({ channelId: c.id })),
      },
    },
    update: {
      ...video,
      Colabs: {
        connectOrCreate: colabs?.map(c => ({
          where: {
            videoId_channelId: { videoId: video.id, channelId: c.id },
          },
          create: { channelId: c.id },
        })),
      },
    },
  })
}

const withColabs = (channels: Channel[]) => (video: Video) => ({
  video,
  colabs: channelsInText(video.description || "", channels),
})
export const upsertVideos = async (videos: Video[]) => {
  const channels = await getAllChannels()
  return Promise.all(
    map(withColabs(channels))(videos).map(({ video, colabs }) =>
      upsertVideo(video, colabs),
    ),
  )
}

export const deleteVideos = (ids: string[]) =>
  db.video.deleteMany({ where: { id: { in: ids } } })
