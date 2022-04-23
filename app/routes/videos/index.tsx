import { VideoView } from "~/components/video-view"
import { db } from "~/db.server"
import { updateVideos } from "~/models/video.server"
import { Box, SimpleGrid } from "@chakra-ui/react"
import { useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/server-runtime"
import moment from "moment"
import type { Channel, Video } from "@prisma/client"
import type { LoaderFunction } from "@remix-run/server-runtime"

type LoaderData = { videos: Array<Video & { channel: Channel }> }

export const loader: LoaderFunction = async () => {
  await updateVideos()
  const data: LoaderData = {
    videos: await db.video.findMany({
      where: {
        AND: [
          {
            scheduledAt: {
              lte: moment().add(14, "day").toDate(),
            },
          },
          { OR: [{ liveStatus: "live" }, { liveStatus: "upcoming" }] },
        ],
      },
      orderBy: { scheduledAt: "asc" },
      include: {
        channel: true,
      },
    }),
  }
  return json(data)
}

export default function JokesIndexRoute() {
  const data = useLoaderData<LoaderData>()

  return (
    <SimpleGrid minChildWidth={240} spacing={4}>
      {data.videos.map((video) => (
        <Box key={video.id}>
          <VideoView video={video} />
        </Box>
      ))}
    </SimpleGrid>
  )
}
