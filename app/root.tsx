import { theme } from "~/lib/theme"
import styles from "~/styles/main.css"
import { ChakraProvider, Container } from "@chakra-ui/react"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import type { MetaFunction } from "@remix-run/node"

export function links() {
  return [{ rel: "stylesheet", href: styles }]
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
        {children}
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
      <ChakraProvider theme={theme}>
        <Container maxW="container.xl">
          <Outlet />
        </Container>
      </ChakraProvider>
    </Document>
  )
}

// How ChakraProvider should be used on CatchBoundary
// export function CatchBoundary() {
//   const caught = useCatch()

//   return (
//     <Document title={`${caught.status} ${caught.statusText}`}>
//       <ChakraProvider theme={theme}>
//         <Box>
//           <Heading as="h1" bg="purple.600">
//             [CatchBoundary]: {caught.status} {caught.statusText}
//           </Heading>
//         </Box>
//       </ChakraProvider>
//     </Document>
//   )
// }

// How ChakraProvider should be used on ErrorBoundary
// export function ErrorBoundary({ error }: { error: Error }) {
//   return (
//     <Document title="Error!">
//       <ChakraProvider theme={theme}>
//         <Box>
//           <Heading as="h1" bg="blue.500">
//             [ErrorBoundary]: There was an error: {error.message}
//           </Heading>
//         </Box>
//       </ChakraProvider>
//     </Document>
//   )
// }
