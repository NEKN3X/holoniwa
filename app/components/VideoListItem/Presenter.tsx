import { Video } from 'models/video'
import { Avatar, Image, Text } from '@mantine/core'

type Props = {
  video: Video
}

const Presenter = ({ video }: Props) => (
  <>
    <div style={{ width: 320, height: 240, margin: 'auto' }}>
      <Image
        radius="md"
        src={
          video.thumbnails.maxres
            ? video.thumbnails.maxres.url
            : video.thumbnails.high.url
        }
        width={320}
        height={180}
        alt={video.title}
      />
      <Avatar radius="xl" />
      <Text weight={500} size="sm">
        {video.title}
      </Text>
    </div>
  </>
)

export default Presenter
