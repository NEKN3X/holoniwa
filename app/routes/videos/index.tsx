import { VideoView } from "~/components/video-view"
import { getVideos } from "~/models/video.server"
import { Box, SimpleGrid } from "@chakra-ui/react"
import { useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/server-runtime"
import * as E from "fp-ts/lib/Either"
import type { LoaderFunction } from "@remix-run/server-runtime"
import type { VideoWithRelations } from "~/models/video.server"

type LoaderData = {
  data: VideoWithRelations[]
}

export const loader: LoaderFunction = async () => {
  const live = await getVideos({
    where: {
      liveStatus: "live",
    },
  })()

  if (E.isLeft(live)) return json({ error: "error" })
  const data = [...live.right]

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
