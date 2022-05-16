import { Avatar } from "@chakra-ui/react"

export const ChannelAvatar = ({
  thumbnail,
  channelId,
}: {
  thumbnail: string
  channelId: string
}) => <Avatar src={thumbnail} as="a" href={`channels/${channelId}`} />
