import Presenter from './Presenter'
import { Video } from 'models/video'

type Props = {
  video: Video
}

const Container = ({ video }: Props) => {
  return (
    <>
      <Presenter video={video} />
    </>
  )
}

export default Container
