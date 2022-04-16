const API_ROOT = 'https://www.googleapis.com/youtube/v3'
const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY!

export const YouTubeURL = (from: string) => {
  return new URL(`${API_ROOT}/${from}?key=${API_KEY}`)
}
