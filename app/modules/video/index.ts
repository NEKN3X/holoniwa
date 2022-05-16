import { parseVideosFeed } from "./feed"
import { youtubeVideosList } from "./youtube"
import { flatten, map, pipe, splitEvery } from "ramda"
import type { Channel, Video } from "@prisma/client"

export type VideoWithRelation = Video & {
  Channel: Pick<Channel, "id" | "thumbnail">
  Collaborations: {
    Channel: Pick<Channel, "id" | "thumbnail">
  }[]
}

export const getVideosFeed = (channelId: string) => parseVideosFeed(channelId)

export const getYouTubeVideos = (videoIds: string[]) =>
  Promise.all(pipe(splitEvery(50), map(youtubeVideosList))(videoIds)).then(
    flatten,
  )

export const connectOrCreateCollaborators = (
  videoId: string,
  collaborators: string[],
) => ({
  Collaborations: {
    connectOrCreate: collaborators.map(id => ({
      where: {
        videoId_channelId: {
          videoId: videoId,
          channelId: id,
        },
      },
      create: {
        channelId: id,
      },
    })),
  },
})

export const createManyCollaborators = (collaborators: string[]) => ({
  Collaborations: {
    createMany: {
      data: collaborators.map(id => ({ channelId: id })),
    },
  },
})
