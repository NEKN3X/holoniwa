import { VideoView } from "~/components/video-view"
import {
  getLiveVideoListItems,
  getUpcomingVideoListItems,
} from "~/models/video.server"
import { Box, SimpleGrid } from "@chakra-ui/react"
import { useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/server-runtime"
import type { LoaderFunction } from "@remix-run/server-runtime"
import type { VideoWithChannel } from "~/models/video.server"

type LoaderData = { live: VideoWithChannel[]; coming: VideoWithChannel[] }

export const loader: LoaderFunction = async () => {
  const live = await getLiveVideoListItems()
  const coming = await getUpcomingVideoListItems()

  return json<LoaderData>({ live, coming })
}

export default function JokesIndexRoute() {
  const data = useLoaderData<LoaderData>()
  const videos = data.live.concat(data.coming)
  return (
    <SimpleGrid minChildWidth={240} spacing={4}>
      {videos.map(video => (
        <Box key={video.id}>
          <VideoView video={video} />
        </Box>
      ))}
    </SimpleGrid>
  )
}
