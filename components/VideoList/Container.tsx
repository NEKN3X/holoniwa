import Presenter from './Presenter'
import { getVideos } from 'models/video'
import useSWR from 'swr'
import Loading from 'components/Loading'
import { VFC } from 'react'

type Props = {
  status: string
}

const Container: VFC<Props> = (props) => {
  const { data } = useSWR(`videos/${props.status}`, () =>
    getVideos(props.status),
  )

  if (!data) return <Loading />

  return (
    <>
      <Presenter videos={data} />
    </>
  )
}

export default Container
