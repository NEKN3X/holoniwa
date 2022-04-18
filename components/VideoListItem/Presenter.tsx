import { Avatar, Image, Text, Center } from '@mantine/core'
import { Video } from 'models/Video'
import { channels } from 'data/channels'
import moment from 'moment'

type Props = {
  video: Video
}

const Presenter = ({ video }: Props) => {
  const diff = moment(video.startAt).add(9, 'h').diff(moment(), 'm')
  return (
    <>
      <div style={{ width: 210, height: 220 }}>
        <Center>
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noreferrer"
          >
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
            <Text size="xs" lineClamp={3}>
              {video.title}
            </Text>
          </Center>
        </Center>
        <Center>
          <a
            href={`https://www.youtube.com/channel/${video.channelId}`}
            target="_blank"
            rel="noreferrer"
          >
            <Avatar
              size={30}
              radius="xl"
              src={
                channels.find((channel) => channel.id === video.channelId)
                  ?.thumbnail
              }
            />
          </a>
          <div style={{ width: 10 }}></div>
          <Text size="xs" color={'gray'}>
            {diff < 0
              ? -diff > 60
                ? `Started ${Math.round(-diff / 60)} hours ago`
                : `Started ${-diff} min ago`
              : diff > 60
              ? `in ${Math.round(diff / 60)} hours`
              : `in ${diff} min`}
          </Text>
        </Center>
      </div>
    </>
  )
}

export default Presenter
