import { extendTheme, type ThemeConfig } from "@chakra-ui/react"
import type { Immutable } from "immer"

const config: Immutable<ThemeConfig> = {
  initialColorMode: "dark",
  useSystemColorMode: true,
}

export const theme = extendTheme({ config })
