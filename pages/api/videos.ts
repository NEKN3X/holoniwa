// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from 'lib/supabase'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const liveStatus = req.query.liveStatus as string

  fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cache`)

  const videos = await supabase
    .from('video')
    .select()
    .eq('liveStatus', liveStatus)
    .order('scheduledAt')
  console.log(videos.data)

  res.status(200).json(videos.data)
}

export default handler
