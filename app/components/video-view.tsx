import { RatioImage } from "./ratio-image"
import { Text, Badge, Box, Link, Avatar } from "@chakra-ui/react"
import moment from "moment"
import { always, cond, divide, equals, gte, lte, pipe, __ } from "ramda"
import type { VideoWithRelations } from "~/models/video.server"

type Props = {
  video: VideoWithRelations
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
  }
  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Link
        isExternal
        href={`https://www.youtube.com/watch?v=${property.videoId}`}
      >
        <RatioImage url={property.imageUrl} alt={property.imageAlt} />
      </Link>
      <Box p={4}>
        <Box display="flex" alignItems="baseline">
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
        </Box>
        <Text
          mt="1"
          fontSize="xs"
          fontWeight="semibold"
          isTruncated
          height={14}
          noOfLines={3}
        >
          {property.title}
        </Text>
        <Box color="gray.500" fontWeight="semibold" letterSpacing="wide">
          <Avatar size="sm" src={property.channelAvatar || ""} />
          {property.colabs?.map(colab => (
            <Avatar
              size="sm"
              key={`${property.videoId}_${property.channelId}`}
              src={colab.Channel?.thumbnail || ""}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
