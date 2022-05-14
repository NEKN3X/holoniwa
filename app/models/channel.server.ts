import { filter } from "ramda"
import type { Channel } from "@prisma/client"

export const channelsInText =
  (channels: readonly Pick<Channel, "id" | "title">[]) => (text: string) =>
    filter(
      channel =>
        text.includes(`@${channel.title}`) || text.includes(channel.id),
      channels,
    )
