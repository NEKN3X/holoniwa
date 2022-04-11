import { NextApiResponse, NextApiRequest } from 'next'
import { parser } from '../../lib/rssParser'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const channelId = req.query.channelId as string
  const feed = await parser.parseURL(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  )
  const data = feed.items.map((data) => {
    return data
  })
  res.status(200).json(data)
}
