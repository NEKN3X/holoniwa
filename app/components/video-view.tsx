import {
  Text,
  Badge,
  Box,
  Link,
  Avatar,
  HStack,
  AvatarGroup,
  Image,
  AspectRatio,
} from "@chakra-ui/react"
import moment from "moment"
import { match } from "ts-pattern"
import type { Video } from "~/models/video.server"

type Props = {
  video: Video
}

export const VideoView = ({ video }: Props) => {
  const property = {
    videoId: video.id,
    imageUrl: video.thumbnail || "",
    imageAlt: video.title,
    title: video.title,
    liveStatus: match(video.liveStatus)
      .with("live", () => "live")
      .with("upcoming", () => "coming")
      .otherwise(() => "archive"),
    statusColor: match(video.liveStatus)
      .with("live", () => "red")
      .with("upcoming", () => "teal")
      .otherwise(() => "gray"),
    channelId: video.channelId,
    channelTitle: video.Channel?.title,
    channelAvatar: video.Channel?.thumbnail,
    scheduledAt: video.scheduledAt,
    scheduleDiff: moment().to(video.scheduledAt),
    collaborations: video.Collaborations,
    badge: video.privacyStatus === "unlisted" ? "member" : "",
  }
  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Box position={"relative"}>
        <Link
          isExternal
          href={`https://www.youtube.com/watch?v=${property.videoId}`}
        >
          <AspectRatio ratio={16 / 9}>
            <Image src={property.imageUrl} alt={property.imageAlt} />
          </AspectRatio>
        </Link>
        <Box
          position={"absolute"}
          bottom={-4}
          left="50%"
          transform={"translate(-50%, -50%);"}
          h={8}
          w="100%"
          bgColor="rgba(0, 0, 0, 0.6)"
          pl={4}
          pr={4}
        >
          <HStack>
            <Box w="100%" h="8">
              <AvatarGroup size="sm" max={6}>
                <Avatar
                  size="sm"
                  src={property.channelAvatar || ""}
                  as="a"
                  href={`http://localhost:3000/channels/${property.channelId}`}
                />
                {property.collaborations?.map(collaboration => (
                  <Avatar
                    size="sm"
                    key={`${property.videoId}_${property.channelId}`}
                    src={collaboration.Channel?.thumbnail || ""}
                  />
                ))}
              </AvatarGroup>
            </Box>
            {property.badge && <Text fontSize="sm">{property.badge}</Text>}
          </HStack>
        </Box>
      </Box>

      <Box p={4}>
        <HStack>
          <Badge borderRadius="full" px="2" colorScheme={property.statusColor}>
            {property.liveStatus}
          </Badge>
          <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            ml="1"
            noOfLines={1}
          >
            {property.scheduleDiff}
          </Box>
        </HStack>
        <Text
          mt={2}
          fontSize="xs"
          fontWeight="semibold"
          height={14}
          noOfLines={3}
        >
          {property.title}
        </Text>
      </Box>
    </Box>
  )
}
