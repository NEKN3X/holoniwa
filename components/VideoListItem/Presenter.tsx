import { Container, Avatar, Image, Text, Center } from '@mantine/core'
import { Video } from '@prisma/client'

type Props = {
  video: Video
}

const Presenter = ({ video }: Props) => (
  <>
    <Container style={{ width: 210, height: 180 }}>
      <Center>
        <a href={video.title} target="_blank" rel="noreferrer">
          <Image
            radius="md"
            src={video.thumbnail!}
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