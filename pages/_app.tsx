import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { MantineProvider } from '@mantine/core'
import { createClient, Provider } from 'urql'

const GRAPHQL_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL!}/graphql`

const client = createClient({
  url: GRAPHQL_ENDPOINT,
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <MantineProvider theme={{ fontFamily: 'Georgia, serif' }}>
        <Component {...pageProps} />
      </MantineProvider>
    </Provider>
  )
}

export default MyApp
