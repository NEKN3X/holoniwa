import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { MantineProvider } from '@mantine/core'
import { Suspense } from 'react'

function MyApp ({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={{ fontFamily: 'Georgia, serif' }}>
      <Suspense fallback={<div>loading</div>}>
        <Component {...pageProps} />
      </Suspense>
    </MantineProvider>
  )
}

export default MyApp
