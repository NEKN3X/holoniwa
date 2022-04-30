import { getChannelsFeed } from "~/lib/rss"
import { getYouTubeVideos } from "~/lib/youtube"
import { getAllChannelIds } from "~/models/channel.server"
import {
  deleteVideos,
  getCurrentVideoListItems,
  getExistingVideos,
  upsertVideos,
} from "~/models/video.server"
import { json } from "@remix-run/server-runtime"
import { difference, flatten, pluck, union } from "ramda"
import type { ActionFunction } from "@remix-run/server-runtime"

export const action: ActionFunction = async ({ request }) => {
  const auth = request.headers.get("Authorization")
  if (auth !== `Bearer ${process.env.API_KEY}`)
    return json({ error: "unauthorized" })

  const channels = pluck("id", await getAllChannelIds())
  const feeds = pluck("id", flatten(await getChannelsFeed(channels)))
  const existing = pluck("id", await getExistingVideos(feeds))
  const newIds = difference(feeds, existing)
  const current = pluck("id", await getCurrentVideoListItems())
  const updating = union(current, newIds)
  const updated = flatten(await Promise.all(getYouTubeVideos(updating)))
  const deleting = difference(updating, pluck("id", updated))
  const data = await upsertVideos(updated)
  const deleted = await deleteVideos(deleting)

  console.log(`newfeed: ${newIds.length}`)
  console.log(`updated: ${updated.length}`)
  console.log(`deleted: ${deleted.count}`)

  return json({ data })
}
