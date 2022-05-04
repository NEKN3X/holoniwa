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

  // フィードを取得
  const feedIds = pipe(
    channels.right,
    RA.map(c => c.id),
    getVideosFeeds,
    TE.map(RA.map(v => v.id)),
  )
  // フィードにある動画のうち、DBに存在する動画を取得
  const existingIds = pipe(
    feedIds,
    TE.chain(ids =>
      getVideos({
        where: { id: { in: RA.toArray(ids) } },
        select: { id: true },
      }),
    ),
    TE.map(RA.map(v => v.id)),
  )
  // フィードにある動画のうち、DBに存在しない動画を取得
  const newIds = pipe(
    sequenceT(TE.ApplyPar)(feedIds, existingIds),
    TE.map(([feedIds, existingIds]) =>
      RA.difference(S.Eq)(feedIds, existingIds),
    ),
  )
  // statusがnoneでない動画を取得
  const currentIds = pipe(
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
  const updatingIds = await pipe(
    sequenceT(TE.ApplyPar)(newIds, currentIds),
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
    TE.map(({ updatingIds, moreIds }) => RA.union(S.Eq)(updatingIds, moreIds)),
  )()
  if (E.isLeft(updatingIds)) return json({ error: updatingIds.left }, 500)

  const updatedVideos = await pipe(updatingIds.right, getYouTubeVideos)()
  if (E.isLeft(updatedVideos)) return json({ error: updatedVideos.left }, 500)

  // DBを更新
  const upsertedVideos = pipe(
    updatedVideos.right,
    RA.map(v => ({
      video: v,
      colabs: RA.difference(S.Eq)(
        channelsInText(channels.right)(v.description || ""),
        [v.channelId, "UCJFZiqLMntJufDCHc6bQixg"],
      ),
    })),
    TE.traverseArray(({ video, colabs }) => upsertVideo(video, colabs)),
  )

  // YouTubeAPIから取得できなかった動画を削除
  const deletedVideos = pipe(
    updatedVideos.right,
    RA.map(u => u.id),
    updatedIds => RA.difference(S.Eq)(updatingIds.right, updatedIds),
    deleteVideos,
  )

  const result = await sequenceT(TE.ApplyPar)(upsertedVideos, deletedVideos)()

  if (E.isLeft(result)) return json({ error: result.left }, 500)

  return json({
    updated: result.right[0].length,
    deleted: result.right[1].count,
  })
}
