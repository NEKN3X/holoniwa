import { db } from "~/utils/db.server"
import { fetchFeed } from "~/utils/fetchFeed"
import { getYouTubeVideos } from "~/utils/youtube"
import { json } from "@remix-run/node"
import fs from "fs"
import path from "path"
import type { Video } from "@prisma/client"
import type { LoaderFunction } from "@remix-run/node"

type LoaderData = { videos: Array<Video> }

const fetchFeeds = async (channels: string[]) => {
  const feeds = channels.map((channel) => fetchFeed(channel))
  const videos = (await Promise.all(feeds)).flat()
  return videos
}

export const loader: LoaderFunction = async () => {
  const channels = await (await db.channel.findMany({})).map((c) => c.id)
  const vids: string[] = []
  const feedVideos = await fetchFeeds(channels)

  const feedsPath = path.join(process.cwd(), "app/data/cache", "feeds.json")
  const videosPath = path.join(process.cwd(), "app/data/cache", "videoss.json")
  const cacheFeeds: string[] = []
  if (fs.existsSync(feedsPath)) {
    cacheFeeds.push(...JSON.parse(fs.readFileSync(feedsPath, "utf8")))
  }
  const cacheVideos: string[] = []
  if (fs.existsSync(videosPath)) {
    cacheVideos.push(...JSON.parse(fs.readFileSync(videosPath, "utf8")))
  }
  const newFeeds = feedVideos.filter((v) => !cacheFeeds.includes(v.id))
  console.log(`Found ${newFeeds.length} new videos`)
  vids.push(...newFeeds.map((v) => v.id))
  vids.push(...cacheVideos)

  const queryCount = vids.length / 50
  const videos: Video[] = []
  for (let i = 0; i < queryCount; i++) {
    const data = await getYouTubeVideos(vids.slice(i * 50, (i + 1) * 50))
    videos.push(...data)
  }
  const newVids = videos.map((v) => v.id)
  const newCache = videos
    .filter((v) => v.liveStatus !== "none")
    .map((v) => v.id)
  const noData = vids.filter((v) => !newVids.includes(v))
  console.log(`Found ${newVids.length} live/upcoming videos`)
  console.log(`Found ${noData.length} videos without data`)

  const upsertQuery = videos.map((v) =>
    db.video.upsert({
      where: { id: v.id },
      create: v,
      update: v,
    }),
  )
  await db.$transaction(upsertQuery).then(() => console.log("Upserted"))
  const deleteQuery = noData.map((v) =>
    db.video.delete({
      where: { id: v },
    }),
  )
  await db.$transaction(deleteQuery).then(() => console.log("Deleted"))

  fs.writeFileSync(
    feedsPath,
    JSON.stringify(feedVideos.map((feed) => feed.id)),
    "utf8",
  )
  fs.writeFileSync(videosPath, JSON.stringify(newCache), "utf8")

  const data: LoaderData = {
    videos: videos,
  }

  return json(data)
}
