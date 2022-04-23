import { updateVideos } from "~/models/video.server"
import { json } from "@remix-run/server-runtime"
import type { LoaderFunction } from "@remix-run/server-runtime"

export const loader: LoaderFunction = async () => {
  await updateVideos()

  const data = { message: "Cron job executed" }

  return json(data)
}
