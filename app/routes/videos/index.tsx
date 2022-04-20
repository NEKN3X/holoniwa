import { db } from "~/utils/db.server"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import type { Video } from "@prisma/client"
import type { LoaderFunction } from "@remix-run/node"

type LoaderData = { videos: Array<Video> }

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    videos: await db.video.findMany({
      take: 5,
    }),
  }
  return json(data)
}

export default function JokesIndexRoute() {
  const data = useLoaderData<LoaderData>()
  return (
    <ul>
      {data.videos.map((video) => (
        <li key={video.id}>{video.title}</li>
      ))}
    </ul>
  )
}
