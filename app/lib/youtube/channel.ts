import { youtube } from "./client"
import { map } from "ramda"
import type { Channel } from "@prisma/client"
import type { youtube_v3 } from "googleapis"

const convertYouTubeChannel = (item: youtube_v3.Schema$Channel) => {
  const snippet = item.snippet!

  return {
    id: item.id,
    title: snippet.title,
    archived: false,
    thumbnail: snippet.thumbnails!.high?.url,
    description: snippet.description,
    publishedAt: snippet.publishedAt && new Date(snippet.publishedAt),
  } as Channel
}

export const youtubeChannelList = (channelIds: string[]) =>
  youtube.channels
    .list({
      id: channelIds,
      part: ["snippet"],
    })
    .then(r => r.data.items!)
    .then(map(convertYouTubeChannel))
