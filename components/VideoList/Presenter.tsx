import { Video } from 'models/Video'
import { VFC } from 'react'
import { VideoListItem } from 'components/VideoListItem'

import { Center, Grid } from '@mantine/core'

type Props = {
  videos: Video[]
}

const Presenter: VFC<Props> = (props) => (
  <>
    <Grid>
      {props.videos.map((video) => (
        <Grid.Col span={3} key={video.id}>
          <Center>
            <VideoListItem video={video} />
          </Center>
        </Grid.Col>
      ))}
    </Grid>
  </>
)

export default Presenter
