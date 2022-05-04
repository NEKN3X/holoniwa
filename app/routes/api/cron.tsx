import { getVideosFeeds } from "~/lib/feed"
import { getYouTubeVideos } from "~/lib/youtube"
import { channelsInText, getChannels } from "~/models/channel.server"
import { deleteVideos, getVideos, upsertVideo } from "~/models/video.server"
import { E, RA, S, TE } from "~/utils/fp-ts"
import { json } from "@remix-run/server-runtime"
import { pipe } from "fp-ts/lib/function"
import type { ActionFunction } from "@remix-run/server-runtime"
import type { Video } from "~/models/video.server"

type ActionData = {
  videos: readonly Video[]
}

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
  if (E.isLeft(channels)) return json({ error: channels.left })

  // フィードを取得
  const feedIds = await pipe(
    channels.right,
    RA.map(c => c.id),
    getVideosFeeds,
    TE.map(RA.map(v => v.id)),
  )()
  if (E.isLeft(feedIds)) return json({ error: feedIds.left }, 500)

  // フィードにある動画のうち、DBに存在する動画を取得
  const existingIds = await pipe(
    feedIds,
    TE.fromEither,
    TE.chain(f =>
      getVideos({ where: { id: { in: RA.toArray(f) } }, select: { id: true } }),
    ),
    TE.map(RA.map(v => v.id)),
  )()
  if (E.isLeft(existingIds)) return json({ error: existingIds.left }, 500)

  // フィードにある動画のうち、DBに存在しない動画を取得
  const newIds = RA.difference(S.Eq)(feedIds.right)(existingIds.right)

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
  console.log(`${updatingIds.length} current videos to update`)

  const moreCount =
    (Math.floor(updatingIds.length / 50) + 1) * 50 - updatingIds.length
  const maybeMoreIds = await pipe(
    getVideos({
      where: {
        liveStatus: "none",
      },
      orderBy: {
        updatedAt: "asc",
      },
      take: moreCount,
    }),
    TE.map(RA.map(v => v.id)),
  )()
  const moreIds = E.isRight(maybeMoreIds) ? maybeMoreIds.right : []
  console.log(`${moreIds.length} archived videos to update`)

  const maybeUpdatedVideos = await pipe(
    RA.union(S.Eq)(updatingIds, moreIds),
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
        channelsInText(channels.right)(u.description || ""),
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

  console.log(`${upsertedVideos.right.length} videos updated`)
  console.log(`${deletedVideos.right.count} videos deleted`)

  return json<ActionData>({ videos: upsertedVideos.right })
}
