import { updateVideos } from "~/modules/video"
import { json } from "@remix-run/server-runtime"
import type { LoaderFunction } from "@remix-run/server-runtime"

export const loader: LoaderFunction = async () => {
  const videos = await updateVideos()

  return json(videos)
}
