import { VideoView } from "./video-view"
import { Box, SimpleGrid } from "@chakra-ui/react"
import type { VideoWithRelation } from ".."

export const VideosGrid = ({ videos }: { videos: VideoWithRelation[] }) => (
  <SimpleGrid columns={[1, 2, 3, 4, 5]} spacing={4}>
    {videos.map(video => (
      <Box key={video.id}>
        <VideoView video={video} />
      </Box>
    ))}
  </SimpleGrid>
)
