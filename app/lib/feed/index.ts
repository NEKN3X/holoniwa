import { parseVideosFeed } from "./video"
import { map } from "ramda"
export { parseVideosFeed } from "./video"

export const getVideosFeeds = (channelIds: readonly string[]) =>
  map(channelId => parseVideosFeed(channelId), channelIds)
