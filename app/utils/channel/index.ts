import { youtubeChannelsList } from "./youtube"
import { filter, flatten, pipe, pluck } from "ramda"
import type { Channel } from "@prisma/client"

const filterChannelsInText =
  (text: string) => (channels: Pick<Channel, "id" | "title">[]) =>
    filter(
      channel =>
        text.includes(`@${channel.title}`) || text.includes(channel.id),
      channels,
    )
export const channelsInText =
  (text: string) => (channels: Pick<Channel, "id" | "title">[]) =>
    pipe(filterChannelsInText(text), pluck("id"))(channels)

export const getYouTubeChannel = (channelId: string[]) =>
  Promise.all(youtubeChannelsList(channelId)).then(flatten)
