import { VideoView } from "./video-view"
import { SimpleGrid } from "@chakra-ui/react"
import type { VideoWithRelation } from ".."

export const VideosGrid = ({ videos }: { videos: VideoWithRelation[] }) => (
  <SimpleGrid columns={[1, 2, 3, 4, 5]} spacing={4}>
    {videos.map(video => (
      <VideoView key={video.id} video={video} />
    ))}
  </SimpleGrid>
)
