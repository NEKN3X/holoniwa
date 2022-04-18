import { Video } from 'models/Video'
import Presenter from './Presenter'

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
