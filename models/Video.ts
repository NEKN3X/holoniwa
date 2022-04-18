export type Video = {
  id: string
  title: string
  channelId: string
  channelTitle: string
  thumbnail: string
  liveStatus: string
  uploadStatus: string
  privacyStatus: string
  publishedAt: Date
  scheduledAt: Date
  startAt: Date
  endAt: Date
  duration: number
}
