import { db } from "~/utils/db.server"
import { json } from "@remix-run/node"
import type { Channel } from "@prisma/client"
import type { LoaderFunction } from "@remix-run/node"

type LoaderData = { channels: Array<Channel> }

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    channels: await db.channel.findMany(),
  }

  return json(data)
}
