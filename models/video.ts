export interface Thumbnail {
  url: string
  width: number
  height: number
}
export interface Video {
  id: string
  title: string
  link: string
  channel: string
  description: string
  thumbnails: {
    default: Thumbnail
    medium: Thumbnail
    high: Thumbnail
    standard: Thumbnail
    maxres: Thumbnail
  }
  scheduled_at: Date
  live_status: string
  privacy_status: string
}
