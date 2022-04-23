import { Box, Image } from "@chakra-ui/react"

type Props = {
  url: string
  alt: string
}

export const RatioImage = ({ url, alt }: Props) => (
  <Box className="Ratio">
    <Image className="Ratio-content" objectFit="cover" src={url} alt={alt} />
  </Box>
)
