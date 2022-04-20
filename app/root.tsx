import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import type { MetaFunction } from "@remix-run/node"

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Holoniwa",
  viewport: "width=device-width,initial-scale=1",
})

export default function App() {
  return (
    <html lang="ja">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
