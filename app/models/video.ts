import { supabase } from 'lib/supabaseClient'

export interface Thumbnail {
  url: string
  width: number
  height: number
}
export interface Video {
  id: string
  title: string
  link: string
  channel: string
  description: string
  thumbnails: {
    default: Thumbnail
    medium: Thumbnail
    high: Thumbnail
    standard: Thumbnail
    maxres: Thumbnail
  }
  scheduled_at: Date
  live_status: string
  privacy_status: string
}

export const getVideos = async (status: string) => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('live_status', status)
    .order('scheduled_at', { ascending: false })

  if (error) throw error

  return data as Video[]
}
