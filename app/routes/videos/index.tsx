import { VideoView } from "~/components/video-view"
import {
  getLiveVideoListItems,
  getRecentVideoListItems,
  getUpcomingVideoListItems,
} from "~/models/video.server"
import { Box, SimpleGrid } from "@chakra-ui/react"
import { useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/server-runtime"
import type { LoaderFunction } from "@remix-run/server-runtime"
import type { VideoWithRelations } from "~/models/video.server"

type LoaderData = {
  data: VideoWithRelations[]
}

export const loader: LoaderFunction = async () => {
  const live = await getLiveVideoListItems()
  const coming = await getUpcomingVideoListItems()
  const recent = await getRecentVideoListItems()

  const data = [...live, ...coming, ...recent]

  return json<LoaderData>({ data })
}

export default function JokesIndexRoute() {
  const data = useLoaderData<LoaderData>()
  return (
    <SimpleGrid minChildWidth={240} spacing={4}>
      {data.data.map(video => (
        <Box key={video.id}>
          <VideoView video={video} />
        </Box>
      ))}
    </SimpleGrid>
  )
}
