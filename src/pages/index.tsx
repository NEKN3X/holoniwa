import { db } from "~/lib/prisma"
import { Channel } from "@prisma/client"
import Head from "next/head"
import type { GetServerSideProps } from "next"

type Props = {
  channels: Channel[]
}

const Home = (props: Props) => {
  return (
    <div>
      <Head>
        <title>Holoniwa</title>
        <meta name="description" content="Hololive schedule" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Holoniwa</h1>
        <ul>
          {props.channels.map(c => (
            <li key={c.id}>{c.title}</li>
          ))}
        </ul>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const channels = await db.channel.findMany()

  return {
    props: {
      channels,
    },
  }
}

export default Home
