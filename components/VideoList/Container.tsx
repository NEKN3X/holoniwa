import Presenter from './Presenter'
import Loading from 'components/Loading'
import { VFC } from 'react'
import useSWR from 'swr'
import { Video } from '@prisma/client'

type Props = {
  status: string
}
const fetcher = (url: string) => fetch(url).then((res) => res.json())
const Container: VFC<Props> = (props) => {
  const { data } = useSWR<Video[]>('api/videos?liveStatus=live', fetcher)

  if (!data) return <Loading />

  return (
    <>
      <Presenter videos={data} />
    </>
  )
}

export default Container
