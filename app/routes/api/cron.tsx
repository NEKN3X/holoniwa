import { getVideosFeeds } from "~/lib/feed"
import { getYouTubeVideos } from "~/lib/youtube"
import { getChannels } from "~/models/channel.server"
import { deleteVideos, getVideos, upsertVideo } from "~/models/video.server"
import { json } from "@remix-run/server-runtime"
import * as E from "fp-ts/lib/Either"
import * as RA from "fp-ts/lib/ReadonlyArray"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import { Eq, includes } from "fp-ts/lib/string"
import type { ActionFunction } from "@remix-run/server-runtime"
import type { Channel } from "~/models/channel.server"

const channelsInText = (channels: readonly Channel[]) => (text: string) =>
  pipe(
    channels,
    RA.filter(c => includes(`@${c.title}`)(text) || includes(c.id)(text)),
  )

export const action: ActionFunction = async ({ request }) => {
  const auth = request.headers.get("Authorization")
  if (auth !== `Bearer ${process.env.API_KEY}`)
    return json({ error: "Unauthorized" }, 401)

  const maybeChannels = await getChannels({})()
  if (E.isLeft(maybeChannels)) return json({ error: "No channels" }, 500)
  const channels = maybeChannels.right

  const feedIds = pipe(
    channels,
    RA.map(c => c.id),
    TE.right,
    TE.map(getVideosFeeds),
    TE.flatten,
    TE.map(RA.map(v => v.id)),
  )
  const existingIds = pipe(
    feedIds,
    TE.map(f =>
      getVideos({ where: { id: { in: RA.toArray(f) } }, select: { id: true } }),
    ),
    TE.flatten,
    TE.map(RA.map(v => v.id)),
  )
  const newIds = pipe(
    TE.Do,
    TE.bind("existing", () => existingIds),
    TE.bind("feeds", () => feedIds),
    TE.map(({ existing, feeds }) => RA.difference(Eq)(feeds, existing)),
  )

  const currentIds = pipe(
    getVideos({
      where: {
        liveStatus: {
          not: "none",
        },
      },
    }),
    TE.map(RA.map(v => v.id)),
  )
  const updatingIds = pipe(
    TE.Do,
    TE.bind("newIds", () => newIds),
    TE.bind("current", () => currentIds),
    TE.map(({ newIds, current }) => RA.union(Eq)(newIds, current)),
  )
  const updatedVideos = pipe(updatingIds, TE.map(getYouTubeVideos), TE.flatten)
  const updatedIds = pipe(updatedVideos, TE.map(RA.map(v => v.id)))
  const deletingIds = pipe(
    TE.Do,
    TE.bind("updating", () => updatingIds),
    TE.bind("updatedIds", () => updatedIds),
    TE.map(({ updating, updatedIds }) =>
      RA.difference(Eq)(updating, updatedIds),
    ),
  )
  const upsertedVideos = await pipe(
    updatedVideos,
    TE.map(
      RA.map(u =>
        upsertVideo({
          where: { id: u.id },
          create: {
            ...u,
            Colabs: {
              create: pipe(
                pipe(channels, channelsInText)(u.description || ""),
                RA.map(c => c.id),
                RA.difference(Eq)([u.channelId, "UCJFZiqLMntJufDCHc6bQixg"]),
                RA.map(c => ({
                  channelId: c,
                })),
                RA.toArray,
              ),
            },
          },
          update: {
            ...u,
            Colabs: {
              connectOrCreate: pipe(
                pipe(channels, channelsInText)(u.description || ""),
                RA.map(c => c.id),
                RA.difference(Eq)([u.channelId, "UCJFZiqLMntJufDCHc6bQixg"]),
                RA.map(c => ({
                  where: {
                    videoId_channelId: {
                      videoId: u.id,
                      channelId: c,
                    },
                  },
                  create: {
                    channelId: c,
                  },
                })),
                RA.toArray,
              ),
            },
          },
        }),
      ),
    ),
    TE.map(TE.sequenceArray),
    TE.flatten,
  )()
  const deletedVideos = await pipe(
    deletingIds,
    TE.map(d =>
      deleteVideos({
        where: { id: { in: RA.toArray(d) } },
      }),
    ),
    TE.flatten,
  )()

  if (E.isLeft(upsertedVideos)) return json({ error: upsertedVideos.left })

  if (E.isLeft(deletedVideos)) return json({ error: deletedVideos.left })

  return json(upsertedVideos.right)
}
