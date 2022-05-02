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
import { always, cond, divide, equals, gte, lte, pipe, __ } from "ramda"
import type { Video } from "~/models/video.server"

type Props = {
  video: Video
}

const statusText = cond([
  [equals("live"), always("Live")],
  [equals("upcoming"), always("Coming")],
  [equals("none"), always("Archive")],
])

const statusColor = cond([
  [equals("live"), always("red")],
  [equals("upcoming"), always("teal")],
  [equals("none"), always("gray")],
])

const timeUnit = cond([
  [gte(60), n => `${n} minute${n > 1 ? "s" : ""}`],
  [
    lte(60 * 24),
    n =>
      pipe(
        divide(__, 60 * 24),
        Math.floor,
        n => `${n} day${n > 1 ? "s" : ""}`,
      )(n),
  ],
  [
    lte(60),
    n =>
      pipe(divide(__, 60), Math.floor, r => `${r} hour${r > 1 ? "s" : ""}`)(n),
  ],
  [
    lte(60 * 24),
    n =>
      pipe(
        divide(__, 60 * 24),
        Math.floor,
        n => `${n} day${n > 1 ? "s" : ""}`,
      )(n),
  ],
])

const scheduleDiff = (date: Date) => {
  const diffMin = moment().diff(date, "minutes")
  const words = []
  if (diffMin < 0) words.push("in")
  words.push(timeUnit(Math.abs(diffMin)))
  if (diffMin > 0) words.push("ago")
  return words.join(" ")
}

export const VideoView = ({ video }: Props) => {
  const property = {
    videoId: video.id,
    imageUrl: video.thumbnail || "",
    imageAlt: video.title,
    title: video.title,
    liveStatus: statusText(video.liveStatus || "none"),
    statusColor: statusColor(video.liveStatus || "none"),
    channelId: video.channelId,
    channelTitle: video.Channel?.title,
    channelAvatar: video.Channel?.thumbnail,
    scheduledAt: video.scheduledAt,
    scheduleDiff: scheduleDiff(video.scheduledAt || new Date()),
    colabs: video.Colabs,
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
                {property.colabs?.map(colab => (
                  <Avatar
                    size="sm"
                    key={`${property.videoId}_${property.channelId}`}
                    src={colab.Channel?.thumbnail || ""}
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
          isTruncated
          height={14}
          noOfLines={3}
        >
          {property.title}
        </Text>
      </Box>
    </Box>
  )
}
