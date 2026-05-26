import { RGBA, SyntaxStyle } from "@opentui/core"
import { createContext, useContext } from "solid-js"

function hexToRgba(hex: string): RGBA {
  const clean = hex.replace("#", "")
  const bigint = parseInt(clean, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return RGBA.fromInts(r, g, b)
}

export const theme = {
  primary: hexToRgba("#fab283"),
  secondary: hexToRgba("#5c9cf5"),
  accent: hexToRgba("#9d7cd8"),
  error: hexToRgba("#e06c75"),
  warning: hexToRgba("#f5a742"),
  success: hexToRgba("#7fd88f"),
  info: hexToRgba("#56b6c2"),
  text: hexToRgba("#eeeeee"),
  textMuted: hexToRgba("#808080"),
  background: hexToRgba("#0a0a0a"),
  backgroundPanel: hexToRgba("#141414"),
  backgroundElement: hexToRgba("#1e1e1e"),
  border: hexToRgba("#484848"),
  borderActive: hexToRgba("#606060"),
  borderSubtle: hexToRgba("#3c3c3c"),
  diffAdded: hexToRgba("#4fd6be"),
  diffRemoved: hexToRgba("#c53b53"),
  diffContext: hexToRgba("#828bb8"),
  diffHunkHeader: hexToRgba("#828bb8"),
  diffHighlightAdded: hexToRgba("#b8db87"),
  diffHighlightRemoved: hexToRgba("#e26a75"),
  diffAddedBg: hexToRgba("#20303b"),
  diffRemovedBg: hexToRgba("#37222c"),
  diffContextBg: hexToRgba("#141414"),
  diffLineNumber: hexToRgba("#8f8f8f"),
  diffAddedLineNumberBg: hexToRgba("#1b2b34"),
  diffRemovedLineNumberBg: hexToRgba("#2d1f26"),
  selectedListItemText: hexToRgba("#eeeeee"),
  markdownText: hexToRgba("#eeeeee"),
  markdownHeading: hexToRgba("#9d7cd8"),
  markdownLink: hexToRgba("#fab283"),
  markdownLinkText: hexToRgba("#56b6c2"),
  markdownCode: hexToRgba("#7fd88f"),
  markdownBlockQuote: hexToRgba("#e5c07b"),
  markdownEmph: hexToRgba("#e5c07b"),
  markdownStrong: hexToRgba("#f5a742"),
  markdownHorizontalRule: hexToRgba("#808080"),
  markdownListItem: hexToRgba("#fab283"),
  markdownListEnumeration: hexToRgba("#56b6c2"),
  markdownImage: hexToRgba("#fab283"),
  markdownImageText: hexToRgba("#56b6c2"),
  markdownCodeBlock: hexToRgba("#eeeeee"),
  syntaxComment: hexToRgba("#808080"),
  syntaxKeyword: hexToRgba("#9d7cd8"),
  syntaxFunction: hexToRgba("#fab283"),
  syntaxVariable: hexToRgba("#e06c75"),
  syntaxString: hexToRgba("#7fd88f"),
  syntaxNumber: hexToRgba("#f5a742"),
  syntaxType: hexToRgba("#e5c07b"),
  syntaxOperator: hexToRgba("#56b6c2"),
  syntaxPunctuation: hexToRgba("#eeeeee"),
}

export const syntax = SyntaxStyle.create()

const ThemeContext = createContext({ theme, syntax })

export function useTheme() {
  return useContext(ThemeContext) ?? { theme, syntax }
}

export function tint(fg: RGBA, bg: RGBA, alpha: number): RGBA {
  const r = Math.round(bg.r * (1 - alpha) + fg.r * alpha)
  const g = Math.round(bg.g * (1 - alpha) + fg.g * alpha)
  const b = Math.round(bg.b * (1 - alpha) + fg.b * alpha)
  return RGBA.fromInts(r, g, b)
}
