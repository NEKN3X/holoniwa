import { youtube } from "~/utils/youtube"
import { map, pipe, splitEvery } from "ramda"
import type { Channel } from "@prisma/client"
import type { youtube_v3 } from "googleapis"

const toDomainChannel = (item: youtube_v3.Schema$Channel): Channel => {
  const snippet = item.snippet!
  return {
    id: item.id!,
    title: snippet.title!,
    thumbnail: snippet.thumbnails!.high?.url!,
  }
}

const _youtubeChannelsList = (channelIds: string[]) =>
  youtube.channels
    .list({
      id: channelIds,
      part: ["snippet"],
    })
    .then(r => r.data.items!)
    .then(items => items.map(toDomainChannel))

export const youtubeChannelsList = (videoIds: string[]) =>
  pipe(splitEvery(50), map(_youtubeChannelsList))(videoIds)
