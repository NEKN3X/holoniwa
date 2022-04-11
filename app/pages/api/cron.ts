import { NextApiResponse, NextApiRequest } from 'next'
import moment from 'moment'
import { supabase } from '../../lib/supabaseClient'
import { parser } from '../../lib/rssParser'

const feed = async (channel: string) => {
  const feed = await parser.parseURL(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channel}`
  )
  const data = feed.items.map((data) => {
    const regexp = /yt:video:/
    const vid = (data.id as string).replace(regexp, '')
    return {
      id: vid,
      title: data.title,
      channel: channel,
      link: data.link,
      published_at: data.pubDate,
    }
  })
  return data
}

const upsertFeeds = async (
  videos: {
    id: string
    title: string | undefined
    channel: string
    link: string | undefined
    published_at: string | undefined
  }[]
) => {
  await supabase.from('videos').upsert(videos)
}

const updateLiveStatus = async (id: string) => {
  await fetch(
    `https://www.googleapis.com/youtube/v3/videos?key=${process.env
      .NEXT_PUBLIC_YOUTUBE_API_KEY!}&id=${id}&part=snippet,status,liveStreamingDetails,contentDetails`
  ).then(async (res) => {
    const json = await res.json()
    console.log(json)
    const data = json.items[0]
    const snippet = data.snippet
    const status = data.status
    const liveStreamingDetails = data.liveStreamingDetails
    const contentDetails = data.contentDetails
    await supabase
      .from('videos')
      .update({
        description: snippet.description,
        thumbnails: snippet.thumbnails,
        category: snippet.categoryId,
        live_status: snippet.liveBroadcastContent,
        upload_status: status.uploadStatus,
        scheduled_at: liveStreamingDetails?.scheduledStartTime,
        started_at: liveStreamingDetails?.actualStartTime,
        end_at: liveStreamingDetails?.actualEndTime,
        duration: moment.duration(contentDetails?.duration).asSeconds(),
      })
      .eq('id', id)
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = req.headers.authorization
  if (auth === process.env.NEXT_PUBLIC_EASY_CRON_AUTH_KEY!) {
    console.log('Authorized')
    await supabase
      .from('channels')
      .select('id')
      .then((data) => {
        console.log(`Upserted channel's new feeds: ${data.data?.length}`)
        data.data?.forEach(async (item) => {
          await feed(item.id).then((data) => {
            upsertFeeds(data)
          })
        })
      })
    await supabase
      .from('videos')
      .select('id,live_status')
      .is('live_status', null)
      .then((data) => {
        console.log(`Fetching none live status: ${data.data?.length}`)
        data.data?.forEach((item) => {
          updateLiveStatus(item.id)
        })
      })
    await supabase
      .from('videos')
      .select('id,live_status')
      .eq('live_status', 'live')
      .then((data) => {
        console.log(`Fetching live status: ${data.data?.length}`)
        data.data?.forEach((item) => {
          updateLiveStatus(item.id)
        })
      })
    await supabase
      .from('videos')
      .select('id,live_status')
      .eq('live_status', 'upcoming')
      .then((data) => {
        console.log(`Fetching upcoming live status: ${data.data?.length}`)
        data.data?.forEach((item) => {
          updateLiveStatus(item.id)
        })
      })
    console.log(`Finished`)
    return res.status(200).end()
  } else {
    return res.status(401).end()
  }
}
