import { getYouTubeChannels } from "~/lib/youtube"
import { upsertChannel } from "~/models/channel.server"
import { E, RA, TE } from "~/utils/fp-ts"
import { json } from "@remix-run/server-runtime"
import { pipe } from "fp-ts/lib/function"
import type { ActionFunction } from "@remix-run/server-runtime"
import type { Channel } from "~/models/channel.server"

type ActionData = {
  channels: readonly Channel[]
}

export const action: ActionFunction = async ({ request }) => {
  const auth = request.headers.get("Authorization")
  if (auth !== `Bearer ${process.env.API_KEY}`)
    return json({ error: "Unauthorized" }, 401)

  const url = new URL(request.url)
  const channelId = url.searchParams.get("channelId")

  if (!channelId) return json({ error: "No channelId" }, 400)

  const channels = getYouTubeChannels([channelId])

  const upsertedChannel = await pipe(
    channels,
    TE.map(
      RA.map(c =>
        upsertChannel({
          where: { id: c.id },
          create: c,
          update: c,
        }),
      ),
    ),
    TE.map(TE.sequenceArray),
    TE.flatten,
  )()

  if (E.isLeft(upsertedChannel))
    return json({ error: upsertedChannel.left }, 400)

  return json<ActionData>({ channels: upsertedChannel.right })
}
