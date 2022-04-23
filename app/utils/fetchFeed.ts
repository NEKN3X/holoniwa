import { parser } from "~/lib/rssParser"

export const fetchYouTubeFeed = (channelId: string) => {
  return parser.parseURL(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
  )
}
