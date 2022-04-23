import { db } from "~/db.server"
import { useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/server-runtime"
import type { Channel } from "@prisma/client"
import type { LoaderFunction } from "@remix-run/server-runtime"

type LoaderData = { channels: Array<Channel> }

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    channels: await db.channel.findMany(),
  }

  return json(data)
}

export default function JokesIndexRoute() {
  const data = useLoaderData<LoaderData>()
  return (
    <ul>
      {data.channels.map((channel) => (
        <li key={channel.id}>{channel.title}</li>
      ))}
    </ul>
  )
}
