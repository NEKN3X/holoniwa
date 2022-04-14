import { Video } from 'models/video'
import { Text } from '@mantine/core'

type Props = {
  video: Video
}

const Presenter = ({ video }: Props) => (
  <>
    <Text key={video.id}>
      {video.title}
      {video.link}
    </Text>
  </>
)

export default Presenter
