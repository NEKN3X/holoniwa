import { VideoList } from 'components/VideoList'
import type { NextPage } from 'next'
import { Text } from '@mantine/core'

const Home: NextPage = () => {
  return (
    <>
      <Text>Live</Text>
      <VideoList status="live" />
      <Text>Upcoming</Text>
      <VideoList status="upcoming" />
    </>
  )
}

export default Home
