import { getYouTubeChannels } from "~/lib/youtube"
import { upsertChannel } from "~/models/channel.server"
import { json } from "@remix-run/server-runtime"
import * as E from "fp-ts/lib/Either"
import * as RA from "fp-ts/lib/ReadonlyArray"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import type { ActionFunction } from "@remix-run/server-runtime"

export const action: ActionFunction = async ({ request, params }) => {
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

  return json(upsertedChannel.right)
}
