import Presenter from './Presenter'
import { gql, useQuery } from 'urql'
import Loading from 'components/Loading'
import { VFC } from 'react'

const VideosQuery = gql`
  query {
    videos {
      id
      title
    }
  }
`

type Props = {
  status: string
}

const Container: VFC<Props> = (props) => {
  const [result] = useQuery({
    query: VideosQuery,
  })
  const { data, fetching, error } = result

  if (fetching) return <Loading />
  if (error) return <p>Oh no... {error.message}</p>

  return (
    <>
      <Presenter videos={data.videos} />
    </>
  )
}

export default Container
