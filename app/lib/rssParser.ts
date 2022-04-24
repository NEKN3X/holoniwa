import Parser from "rss-parser"
export const parser = new Parser()

export const fetchYouTubeFeed = (channelId: string) => {
  return parser.parseURL(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
  )
}
