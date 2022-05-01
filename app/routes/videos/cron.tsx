import { getChannelsFeed } from "~/lib/rss"
import { getYouTubeVideos } from "~/lib/youtube"
import { getChannels } from "~/models/channel.server"
import { deleteVideos, getVideos, upsertVideo } from "~/models/video.server"
import { json } from "@remix-run/server-runtime"
import { difference, union } from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as RA from "fp-ts/lib/ReadonlyArray"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import { Eq } from "fp-ts/lib/string"
import { pluck } from "ramda"
import type { ActionFunction } from "@remix-run/server-runtime"

export const action: ActionFunction = async ({ request }) => {
  const auth = request.headers.get("Authorization")
  if (auth !== `Bearer ${process.env.API_KEY}`)
    return json({ error: "Unauthorized" })

  const channels = await getChannels({})()
  const feeds = await pipe(
    channels,
    E.map(pluck("id")),
    E.map(getChannelsFeed),
    TE.fromEither,
    TE.flatten,
    TE.map(RA.toArray),
    TE.map(pluck("id")),
  )()
  const existing = await pipe(
    feeds,
    TE.fromEither,
    TE.map(f => getVideos({ where: { id: { in: f } }, select: { id: true } })),
    TE.flatten,
    TE.map(pluck("id")),
  )()
  const newIds = pipe(
    existing,
    E.map(e => pipe(feeds, E.map(difference(Eq)(e)))),
    E.flatten,
  )

  const current = await pipe(
    getVideos({
      where: {
        liveStatus: {
          not: "none",
        },
      },
    }),
    TE.map(pluck("id")),
  )()
  const updating = pipe(
    newIds,
    E.map(n =>
      pipe(
        current,
        E.map(c => union(Eq)(c, n)),
      ),
    ),
    E.flatten,
  )
  const updated = await pipe(
    updating,
    E.map(getYouTubeVideos),
    TE.fromEither,
    TE.flatten,
  )()
  const deleting = pipe(
    updating,
    E.map(u =>
      pipe(
        updated,
        E.map(RA.toArray),
        E.map(pluck("id")),
        E.map(c => difference(Eq)(u, c)),
      ),
    ),
    E.flatten,
  )
  const data = await pipe(
    updated,
    E.map(
      RA.map(u =>
        upsertVideo({
          where: { id: u.id },
          create: u,
          update: u,
        }),
      ),
    ),
    E.map(TE.sequenceArray),
    TE.fromEither,
    TE.flatten,
  )()
  const deleted = await pipe(
    deleting,
    E.map(d =>
      deleteVideos({
        where: { id: { in: d } },
      }),
    ),
    TE.fromEither,
    TE.flatten,
  )()

  if (E.isLeft(newIds)) return json({ error: newIds.left })
  if (E.isLeft(updated)) return json({ error: updated.left })
  if (E.isLeft(deleted)) return json({ error: deleted.left })

  console.log(`newfeed: ${newIds.right.length}`)
  console.log(`updated: ${updated.right.length}`)
  console.log(`deleted: ${deleted.right.count}`)

  if (E.isLeft(data)) return json({ error: data.left })

  return json(data.right)
}
