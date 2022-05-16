import { db } from "~/db.server"
import { VideosGrid } from "~/modules/video/components/videos-grid"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/server-runtime"
import moment from "moment"
import type { LoaderFunction } from "@remix-run/server-runtime"
import type { VideoWithRelation } from "~/modules/video"

type LoaderData = { videos: VideoWithRelation[] }

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
  const videos = await db.video.findMany({
    where: {
      liveStatus: {
        in: ["live", "upcoming"],
      },
      scheduledAt: {
        lte: moment().add(2, "w").toDate(),
      },
    },
    orderBy: [{ startAt: "asc" }, { scheduledAt: "asc" }],
    ...option,
  })

  return json<LoaderData>({ videos })
}

export default function Index() {
  const data = useLoaderData<LoaderData>()

  return (
    <>
      <Tabs isLazy>
        <TabList>
          <Tab>Schedule</Tab>
          <Tab>Archive</Tab>
        </TabList>
        <TabPanels>
          <TabPanel paddingX={0}>
            <VideosGrid videos={data.videos} />
          </TabPanel>
          <TabPanel paddingX={0}>
            <VideosGrid videos={data.videos} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  )
}
