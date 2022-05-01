import { VideoView } from "~/components/video-view"
import { getVideos } from "~/models/video.server"
import { Box, SimpleGrid } from "@chakra-ui/react"
import { useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/server-runtime"
import * as E from "fp-ts/lib/Either"
import moment from "moment"
import type { LoaderFunction } from "@remix-run/server-runtime"
import type { VideoWithRelations } from "~/models/video.server"

type LoaderData = {
  data: VideoWithRelations[]
}

const option = {
  include: {
    Channel: {
      select: {
        id: true,
        thumbnail: true,
      },
    },
    Colabs: {
      select: {
        Channel: {
          select: {
            id: true,
            thumbnail: true,
          },
        },
      },
    },
  },
}

export const loader: LoaderFunction = async () => {
  const live = await getVideos({
    where: {
      liveStatus: "live",
    },
    orderBy: {
      startAt: "desc",
    },
    ...option,
  })()
  const coming = await getVideos({
    where: {
      liveStatus: "upcoming",
      scheduledAt: {
        lte: moment().add(2, "w").toDate(),
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
    ...option,
  })()
  const archive = await getVideos({
    where: {
      liveStatus: "none",
      startAt: {
        gte: moment().subtract(1, "d").toDate(),
      },
    },
    orderBy: {
      startAt: "desc",
    },
    ...option,
  })()

  if (E.isLeft(live)) return json({ error: live.left })
  if (E.isLeft(coming)) return json({ error: coming.left })
  if (E.isLeft(archive)) return json({ error: archive.left })

  const data = [...live.right, ...coming.right, ...archive.right]

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
