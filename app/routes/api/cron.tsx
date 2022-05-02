import { getVideosFeeds } from "~/lib/feed"
import { getYouTubeVideos } from "~/lib/youtube"
import { channelsInText, getChannels } from "~/models/channel.server"
import { deleteVideos, getVideos, upsertVideo } from "~/models/video.server"
import { json } from "@remix-run/server-runtime"
import * as E from "fp-ts/lib/Either"
import * as RA from "fp-ts/lib/ReadonlyArray"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import * as S from "fp-ts/lib/string"
import type { ActionFunction } from "@remix-run/server-runtime"

export const action: ActionFunction = async ({ request }) => {
  const auth = request.headers.get("Authorization")
  if (auth !== `Bearer ${process.env.API_KEY}`)
    return json({ error: "Unauthorized" }, 401)

  // チャンネルを取得
  const maybeChannels = await getChannels({
    select: {
      id: true,
      title: true,
    },
  })()
  if (E.isLeft(maybeChannels)) return json({ error: maybeChannels.left }, 500)
  const channels = maybeChannels.right
  const channelIds = pipe(
    channels,
    RA.map(c => c.id),
  )

  // フィードを取得
  const maybeFeedIds = await pipe(
    channelIds,
    TE.right,
    TE.map(getVideosFeeds),
    TE.flatten,
    TE.map(RA.map(v => v.id)),
  )()
  if (E.isLeft(maybeFeedIds)) return json({ error: maybeFeedIds.left }, 500)
  const feedIds = maybeFeedIds.right

  // フィードにある動画のうち、DBに存在する動画を取得
  const maybeExistingIds = await pipe(
    feedIds,
    TE.right,
    TE.map(f =>
      getVideos({ where: { id: { in: RA.toArray(f) } }, select: { id: true } }),
    ),
    TE.flatten,
    TE.map(RA.map(v => v.id)),
  )()
  if (E.isLeft(maybeExistingIds))
    return json({ error: maybeExistingIds.left }, 500)
  const existingIds = maybeExistingIds.right

  // フィードにある動画のうち、DBに存在しない動画を取得
  const newIds = RA.difference(S.Eq)(feedIds, existingIds)

  // statusがnoneでない動画を取得
  const maybeCurrentIds = await pipe(
    getVideos({
      where: {
        liveStatus: {
          not: "none",
        },
      },
    }),
    TE.map(RA.map(v => v.id)),
  )()
  if (E.isLeft(maybeCurrentIds))
    return json({ error: maybeCurrentIds.left }, 500)
  const currentIds = maybeCurrentIds.right

  // YouTubeAPIから最新の動画情報を取得
  const updatingIds = RA.union(S.Eq)(newIds, currentIds)
  const maybeUpdatedVideos = await pipe(
    updatingIds,
    TE.right,
    TE.map(getYouTubeVideos),
    TE.flatten,
  )()
  if (E.isLeft(maybeUpdatedVideos))
    return json({ error: maybeUpdatedVideos.left }, 500)
  const updatedVideos = maybeUpdatedVideos.right
  const updatedIds = pipe(
    updatedVideos,
    RA.map(v => v.id),
  )

  // DBを更新
  const upsertedVideos = await pipe(
    updatedVideos,
    RA.map(u => ({
      video: u,
      colabs: RA.difference(S.Eq)(
        channelsInText(channels)(u.description || ""),
        [u.channelId, "UCJFZiqLMntJufDCHc6bQixg"],
      ),
    })),
    RA.map(({ video, colabs }) => upsertVideo(video, colabs)),
    TE.sequenceArray,
  )()

  // YouTubeAPIから取得できなかった動画を削除
  const deletingIds = RA.difference(S.Eq)(updatingIds, updatedIds)
  const deletedVideos = await pipe(deletingIds, deleteVideos)()

  if (E.isLeft(upsertedVideos)) return json({ error: upsertedVideos.left })

  if (E.isLeft(deletedVideos)) return json({ error: deletedVideos.left })

  return json(upsertedVideos.right)
}
