import { getVideosFeeds } from "~/lib/feed"
import { getYouTubeVideos } from "~/lib/youtube"
import { channelsInText, getChannels } from "~/models/channel.server"
import { deleteVideos, getVideos, upsertVideo } from "~/models/video.server"
import { E, RA, S, TE } from "~/utils/fp-ts"
import { json } from "@remix-run/server-runtime"
import { sequenceT } from "fp-ts/lib/Apply"
import { pipe } from "fp-ts/lib/function"
import type { ActionFunction } from "@remix-run/server-runtime"

export const action: ActionFunction = async ({ request }) => {
  const auth = request.headers.get("Authorization")
  if (auth !== `Bearer ${process.env.API_KEY}`)
    return json({ error: "Unauthorized" }, 401)

  // チャンネルを取得
  const channels = await getChannels({
    where: {
      archived: false,
    },
    select: {
      id: true,
      title: true,
    },
  })()
  if (E.isLeft(channels)) return json({ error: channels.left }, 500)

  // フィードから新規の動画を取得
  const getNewIdsTask = pipe(
    channels.right,
    RA.map(c => c.id),
    getVideosFeeds,
    TE.map(RA.map(v => v.id)),
    TE.bindTo("feedIds"),
    TE.bind("existingIds", ({ feedIds }) =>
      pipe(
        getVideos({
          where: { id: { in: RA.toArray(feedIds) } },
          select: { id: true },
        }),
        TE.map(RA.map(v => v.id)),
      ),
    ),
    TE.map(({ feedIds, existingIds }) =>
      RA.difference(S.Eq)(feedIds, existingIds),
    ),
  )
  // DBからstatusがnoneでない動画を取得
  const getCurrentIdsTask = pipe(
    getVideos({
      where: {
        liveStatus: {
          not: "none",
        },
      },
      select: {
        id: true,
      },
    }),
    TE.map(RA.map(v => v.id)),
  )
  // YouTubeAPIから動画情報を取得
  const updated = await pipe(
    sequenceT(TE.ApplyPar)(getNewIdsTask, getCurrentIdsTask),
    TE.map(([newIds, currentIds]) => RA.union(S.Eq)(newIds)(currentIds)),
    TE.bindTo("updatingIds"),
    TE.bind("moreIds", ({ updatingIds }) =>
      pipe(
        (Math.floor(updatingIds.length / 50) + 1) * 50 - updatingIds.length,
        count =>
          getVideos({
            where: {
              liveStatus: "none",
            },
            select: {
              id: true,
            },
            orderBy: {
              updatedAt: "asc",
            },
            take: count,
          }),
        TE.map(RA.map(v => v.id)),
      ),
    ),
    TE.map(({ moreIds, updatingIds }) => RA.union(S.Eq)(updatingIds, moreIds)),
    TE.bindTo("updatingIds"),
    TE.bind("updatedVideos", ({ updatingIds }) =>
      getYouTubeVideos(updatingIds),
    ),
    TE.map(({ updatingIds, updatedVideos }) => ({
      upsertingVideos: updatedVideos,
      deletingIds: RA.difference(S.Eq)(updatingIds)(
        updatedVideos.map(v => v.id),
      ),
    })),
  )()
  if (E.isLeft(updated)) return json({ error: updated.left }, 500)

  // DBを更新
  const upsertTask = pipe(
    updated.right.upsertingVideos,
    RA.map(v => ({
      video: v,
      colabs: RA.difference(S.Eq)(
        channelsInText(channels.right)(v.description || ""),
        [v.channelId, "UCJFZiqLMntJufDCHc6bQixg"],
      ),
    })),
    TE.traverseArray(({ video, colabs }) => upsertVideo(video, colabs)),
  )
  const deleteTask = deleteVideos(updated.right.deletingIds)
  const result = await sequenceT(TE.ApplyPar)(upsertTask, deleteTask)()
  if (E.isLeft(result)) return json({ error: result.left }, 500)

  return json({
    updated: result.right[0].length,
    deleted: result.right[1].count,
  })
}
