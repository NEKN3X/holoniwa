import { NextApiResponse, NextApiRequest } from 'next'
import { supabase } from '../../lib/supabaseClient'
const cronAuthKey = process.env.NEXT_PUBLIC_EASY_CRON_AUTH_KEY!

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = req.headers.authorization
  if (auth === cronAuthKey) {
    const { data, error } = await supabase
      .from('test')
      .insert([{ text: 'cron test' }])
    return res.status(200).json({ data, error })
  } else {
    return res.status(401).end()
  }
}
