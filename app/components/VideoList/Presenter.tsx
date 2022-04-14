import { Video } from 'models/video'
import { VFC } from 'react'
import { VideoListItem } from 'components/VideoListItem'

type Props = {
  videos: Video[]
}

const Presenter: VFC<Props> = (props) => (
  <>
    {props.videos.map((video) => (
      <VideoListItem key={video.id} video={video} />
    ))}
  </>
)

export default Presenter
