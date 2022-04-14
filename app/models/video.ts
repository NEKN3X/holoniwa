import { supabase } from 'lib/supabaseClient'

export interface Video {
  id: string
  title: string
  link: string
}

export const getVideos = async (status: string) => {
  const { data, error } = await supabase
    .from('videos')
    .select('id, title, link')
    .eq('live_status', status)

  if (error) throw error

  return data as Video[]
}
