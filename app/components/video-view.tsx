import { RatioImage } from "./ratio-image"
import { Text, Badge, Box, Link } from "@chakra-ui/react"
import moment from "moment"
import type { Channel, Video } from "@prisma/client"

type Props = {
  video: Video & { channel: Channel }
}

const liveStatus = (status: string) => {
  switch (status) {
    case "live":
      return "live"
    case "upcoming":
      return "coming"
    case "none":
      return "archive"
  }
}

const statusColor = (status: string) => {
  switch (status) {
    case "live":
      return "red"
    case "upcoming":
      return "teal"
    case "none":
      return "gray"
  }
}

const scheduleDiff = (date: Date) => {
  const diffMin = moment().diff(date, "minutes")
  const words = []
  if (diffMin < 0) words.push("in")
  Math.abs(diffMin) > 60
    ? words.push(`${Math.abs(Math.round(diffMin / 60))}hours`)
    : words.push(`${Math.abs(diffMin)}min`)
  if (diffMin > 0) words.push("ago")
  return words.join(" ")
}

const channelRegex = /(hololive-..)|(- holoX -)|((- |)V(t|T)uber.+)/

export const VideoView = ({ video }: Props) => {
  const property = {
    videoId: video.id,
    imageUrl: video.thumbnail || "",
    imageAlt: video.title,
    title: video.title,
    liveStatus: liveStatus(video.liveStatus || "none"),
    statusColor: statusColor(video.liveStatus || "none"),
    channelId: video.channel.id,
    channelTitle: video.channel.title.replace(channelRegex, ""),
    scheduledAt: video.scheduledAt,
    scheduleDiff: scheduleDiff(video.scheduledAt || new Date()),
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
        <Box
          color="gray.500"
          fontWeight="semibold"
          letterSpacing="wide"
          fontSize="xs"
          noOfLines={1}
        >
          <Link href={`channels/${property.channelId}`} color="teal.500">
            {property.channelTitle}
          </Link>
        </Box>
      </Box>
    </Box>
  )
}
