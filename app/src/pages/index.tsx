import { Text } from '@mantine/core'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const Home: NextPage = () => {
  const [videos, setVideos] = useState(
    [] as { id: string; title: string; link: string }[],
  )
  useEffect(() => {
    const getVideos = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('id, title, link')
        .eq('live_status', 'live')
      if (error || !data) return
      console.log(data)
      setVideos(data)
    }
    getVideos()
  }, [])
  return (
    <Text>
      {videos.map((video) => (
        <Text key={video.id}>
          {video.title}
          {video.link}
        </Text>
      ))}
      {videos.length}
    </Text>
  )
}

export default Home
