import { getChannel } from "~/models/channel.server"
import { E } from "~/utils/fp-ts"
import { json } from "@remix-run/server-runtime"
import type { LoaderFunction } from "@remix-run/server-runtime"
import type { Channel } from "~/models/channel.server"

type LoaderData = { channel: Channel }

export const loader: LoaderFunction = async ({ params }) => {
  const channel = await getChannel({ where: { id: params.channelId } })()

  if (E.isLeft(channel)) return json({ error: channel.left }, 400)

  return json<LoaderData>({ channel: channel.right })
}
