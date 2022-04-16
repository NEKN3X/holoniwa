import { Video } from 'models/video'
import { Container, Avatar, Image, Text, Center } from '@mantine/core'

type Props = {
  video: Video
}

const Presenter = ({ video }: Props) => (
  <>
    <Container style={{ width: 210, height: 180 }}>
      <Center>
        <a href={video.link} target="_blank" rel="noreferrer">
          <Image
            radius="md"
            src={
              video.thumbnails.maxres
                ? video.thumbnails.maxres.url
                : video.thumbnails.high.url
            }
            width={210}
            height={120}
            alt={video.title}
          />
        </a>
      </Center>
      <Center style={{ height: 60, display: 'flex' }}>
        <Center>
          <Avatar radius="xl" />
        </Center>
        <Center ml="sm">
          <Text weight={500} size="sm" lineClamp={2}>
            {video.title}
          </Text>
        </Center>
      </Center>
    </Container>
  </>
)

export default Presenter
