import { Badge, HStack, Text } from "@chakra-ui/react"
import moment from "moment"
import { match } from "ts-pattern"
import type { Video } from "@prisma/client"

const statusBadge = (video: Video) =>
  video.endAt
    ? "archive"
    : moment().isAfter(video.scheduledAt)
    ? "live"
    : "coming"
const statusColor = (status: string) =>
  match(status)
    .with("live", () => "red")
    .with("coming", () => "teal")
    .otherwise(() => "gray")
const diffTime = (date: Date) => moment().to(date)

export const VideoStatus = ({ video }: { video: Video }) => {
  const badge = statusBadge(video)
  const badgeColor = statusColor(badge)
  const message = video.endAt
    ? video.endAt.toString()
    : video.startAt
    ? diffTime(video.startAt)
    : video.scheduledAt
    ? diffTime(video.scheduledAt)
    : ""

  return (
    <HStack>
      <Badge borderRadius="full" px="2" colorScheme={badgeColor}>
        {badge}
      </Badge>
      <Text
        as="time"
        color="gray.500"
        fontWeight="semibold"
        fontSize="xs"
        ml="1"
        noOfLines={1}
      >
        {message}
      </Text>
    </HStack>
  )
}
