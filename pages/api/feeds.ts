import { parser } from 'lib/rssParser'
import type { NextApiRequest, NextApiResponse } from 'next'

const parseFeed = async (channelId: string) => {
  return await parser.parseURL(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
  )
}
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const channelId = req.query.channel as string
  const data = await parseFeed(channelId)
  return res.status(200).json(data)
}

export default handler
