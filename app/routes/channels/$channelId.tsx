import { db } from "~/db.server"
import { json } from "@remix-run/server-runtime"
import type { Channel } from "@prisma/client"
import type { LoaderFunction } from "@remix-run/server-runtime"

type LoaderData = { channel: Channel }

export const loader: LoaderFunction = async ({ params }) => {
  const channel = await db.channel.findUnique({
    where: { id: params.channelId },
  })

  if (!channel) return json({ error: "Not Found" }, 404)

  return json<LoaderData>({ channel: channel })
}
