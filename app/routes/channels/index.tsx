import { db } from "~/db.server"
import { useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/server-runtime"
import type { Channel } from "@prisma/client"
import type { LoaderFunction } from "@remix-run/server-runtime"

type LoaderData = { channels: readonly Channel[] }

export const loader: LoaderFunction = async () => {
  const channels = await db.channel.findMany({})

  return json<LoaderData>({ channels: channels })
}

export default function JokesIndexRoute() {
  const data = useLoaderData<LoaderData>()
  return (
    <ul>
      {data.channels.map(channel => (
        <li key={channel.id}>{channel.title}</li>
      ))}
    </ul>
  )
}
