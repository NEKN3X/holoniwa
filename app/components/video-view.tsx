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
import type { Channel, Video } from "@prisma/client"

type Props = {
  video: Video
  channel: Pick<Channel, "id" | "thumbnail">
  collaborators: Pick<Channel, "id" | "thumbnail">[]
}

export const VideoView = ({ video, channel, collaborators }: Props) => {
  const property = {
    liveStatus: match(video.liveStatus)
      .with("live", () => "live")
      .with("upcoming", () => "coming")
      .otherwise(() => "archive"),
    statusColor: match(video.liveStatus)
      .with("live", () => "red")
      .with("upcoming", () => "teal")
      .otherwise(() => "gray"),
    scheduleDiff: moment().to(video.scheduledAt),
    badge: video.privacyStatus === "unlisted" ? "member" : "",
  }
  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
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
                  src={channel.thumbnail || ""}
                  as="a"
                  href={`http://localhost:3000/channels/${channel.id}`}
                />
                {collaborators?.map(c => (
                  <Avatar
                    size="sm"
                    key={`${video.id}_${c.id}`}
                    src={c.thumbnail || ""}
                  />
                ))}
              </AvatarGroup>
            </Box>
            <Text fontSize="sm">{property.badge}</Text>
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
          {video.title}
        </Text>
      </Box>
    </Box>
  )
}
