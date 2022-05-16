import { VideoStatus } from "./video-status"
import {
  Text,
  Box,
  Link,
  HStack,
  AvatarGroup,
  Image,
  AspectRatio,
  Avatar,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react"
import type { VideoWithRelation } from ".."

const memberOnly = (status: string) => status === "unlisted"

export const VideoView = ({ video }: { video: VideoWithRelation }) => {
  return (
    <Box rounded="lg" overflow="hidden">
      <Box position={"relative"}>
        <Link isExternal href={`https://www.youtube.com/watch?v=${video.id}`}>
          <AspectRatio ratio={16 / 9}>
            <Image src={video.thumbnail || ""} alt={video.title} />
          </AspectRatio>
        </Link>
        <Box
          position={"absolute"}
          bottom={-4}
          left="50%"
          transform={"translate(-50%, -50%);"}
          h={8}
          w="101%"
          bgColor="rgba(0, 0, 0, 0.6)"
        />
        <HStack
          position={"absolute"}
          bottom={-4}
          left="50%"
          transform={"translate(-50%, -50%);"}
          h={8}
          w="100%"
          paddingX={2}
        >
          <Box w="100%" h="8">
            <AvatarGroup size="sm" max={6}>
              <Avatar
                src={video.Channel.thumbnail}
                as="a"
                href={`channels/${video.channelId}`}
              />
              {video.Collaborations.map(({ Channel }) => (
                <Avatar
                  key={`${video.id}_${Channel.id}`}
                  src={Channel.thumbnail}
                  as="a"
                  href={`channels/${Channel.id}`}
                />
              ))}
            </AvatarGroup>
          </Box>
          <Text fontSize="sm">
            {memberOnly(video.privacyStatus) && "member"}
          </Text>
        </HStack>
      </Box>

      <LinkBox pt={2} as="article">
        <VideoStatus video={video} />
        <LinkOverlay
          mt={2}
          fontSize="xs"
          fontWeight="semibold"
          height={14}
          noOfLines={3}
          href={`https://www.youtube.com/watch?v=${video.id}`}
        >
          {video.title}
        </LinkOverlay>
      </LinkBox>
    </Box>
  )
}
