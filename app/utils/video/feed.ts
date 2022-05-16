import Parser from "rss-parser"

const videosFeedParser: Parser<CustomFeed, CustomItem> = new Parser()

interface CustomFeed {
  author: string
}
interface CustomItem {
  id: string
}

const formatVideoId = (item: CustomItem) => {
  return item.id.replace(/yt:video:/, "")
}

export const parseVideosFeed = (channelId: string) =>
  videosFeedParser
    .parseURL(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    )
    .then(({ items }) => items.slice(0, 4).map(formatVideoId))
    .catch(() => [] as string[])
