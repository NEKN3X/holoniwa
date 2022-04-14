import { VideoList } from 'components/VideoList'
import type { NextPage } from 'next'
import { Container, Divider } from '@mantine/core'

const Home: NextPage = () => {
  return (
    <>
      <Container>
        <Divider my="xs" label="LIVE" labelPosition="center" />
        <VideoList status="live" />
        <Divider my="xs" label="UPCOMING" labelPosition="center" />
        <VideoList status="upcoming" />
      </Container>
    </>
  )
}

export default Home
