import { Header } from "./components/header"
import { theme } from "~/utils/theme"
import { ChakraProvider, Container, Heading } from "@chakra-ui/react"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react"
import type { MetaFunction } from "@remix-run/node"

export function links() {
  return [{ rel: "stylesheet" }]
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  viewport: "width=device-width,initial-scale=1",
})

function Document({
  children,
  title = "Holoniwa",
}: {
  children: React.ReactNode
  title?: string
}) {
  return (
    <html lang="ja">
      <head>
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        <ChakraProvider theme={theme}>
          <Header />
          <Container maxW="container.xl" p={8}>
            {children}
          </Container>
        </ChakraProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  return (
    <Document>
      <Heading as="h1">
        [CatchBoundary]: {caught.status} {caught.statusText}
      </Heading>
    </Document>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document>
      <Heading as="h1">
        [ErrorBoundary]: There was an error: {error.message}
      </Heading>
    </Document>
  )
}
