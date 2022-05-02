import { getChannels } from "~/models/channel.server"
import { E } from "~/utils/fp-ts"
import { useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/server-runtime"
import type { LoaderFunction } from "@remix-run/server-runtime"
import type { Channel } from "~/models/channel.server"

type LoaderData = { channels: readonly Channel[] }

export const loader: LoaderFunction = async () => {
  const channels = await getChannels({})()

  if (E.isLeft(channels)) return json({ error: channels.left }, 400)

  return json<LoaderData>({ channels: channels.right })
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
