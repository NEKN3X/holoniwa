import { VideoView } from "~/components/video-view"
import { db } from "~/db.server"
import { Box, SimpleGrid } from "@chakra-ui/react"
import { useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/server-runtime"
import moment from "moment"
import { pluck, union } from "ramda"
import type { Video } from "@prisma/client"
import type { LoaderFunction } from "@remix-run/server-runtime"

type LoaderData = (Video & {
  Channel: {
    id: string
    thumbnail: string | null
  }
  Collaborations: {
    Channel: {
      id: string
      thumbnail: string | null
    }
  }[]
})[]

const option = {
  include: {
    Channel: {
      select: {
        id: true,
        thumbnail: true,
      },
    },
    Collaborations: {
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
  const live = await db.video.findMany({
    where: {
      liveStatus: "live",
    },
    orderBy: {
      startAt: "desc",
    },
    ...option,
  })
  const coming = await db.video.findMany({
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
  })
  const archive = await db.video.findMany({
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
  })

  const videos = union(union(live, coming), archive)

  return json<LoaderData>(videos)
}

export default function JokesIndexRoute() {
  const data = useLoaderData<LoaderData>()
  return (
    <SimpleGrid minChildWidth={240} spacing={4}>
      {data.map(video => (
        <Box key={video.id}>
          <VideoView
            video={video}
            channel={video.Channel}
            collaborators={pluck("Channel", video.Collaborations)}
          />
        </Box>
      ))}
    </SimpleGrid>
  )
}
