import { youtubeChannelList } from "./channel"
import { youtubeVideoList } from "./video"
import { map, pipe, splitEvery } from "ramda"

export const getYouTubeChannels = (channelIds: readonly string[]) =>
  pipe(splitEvery(50), map(youtubeChannelList))(channelIds)

export const getYouTubeVideos = (channelIds: readonly string[]) =>
  pipe(splitEvery(50), map(youtubeVideoList))(channelIds)
