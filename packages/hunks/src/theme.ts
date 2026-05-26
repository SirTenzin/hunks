import { RGBA, SyntaxStyle } from "@opentui/core"
import { createSignal, createMemo, createRoot } from "solid-js"
import { homedir } from "node:os"
import { join } from "node:path"

// Theme JSON imports - all 33 themes from opencode
import aura from "./themes/aura.json" with { type: "json" }
import ayu from "./themes/ayu.json" with { type: "json" }
import carbonfox from "./themes/carbonfox.json" with { type: "json" }
import catppuccin from "./themes/catppuccin.json" with { type: "json" }
import catppuccinFrappe from "./themes/catppuccin-frappe.json" with { type: "json" }
import catppuccinMacchiato from "./themes/catppuccin-macchiato.json" with { type: "json" }
import cobalt2 from "./themes/cobalt2.json" with { type: "json" }
import cursor from "./themes/cursor.json" with { type: "json" }
import dracula from "./themes/dracula.json" with { type: "json" }
import everforest from "./themes/everforest.json" with { type: "json" }
import flexoki from "./themes/flexoki.json" with { type: "json" }
import github from "./themes/github.json" with { type: "json" }
import gruvbox from "./themes/gruvbox.json" with { type: "json" }
import kanagawa from "./themes/kanagawa.json" with { type: "json" }
import lucentOrng from "./themes/lucent-orng.json" with { type: "json" }
import material from "./themes/material.json" with { type: "json" }
import matrix from "./themes/matrix.json" with { type: "json" }
import mercury from "./themes/mercury.json" with { type: "json" }
import monokai from "./themes/monokai.json" with { type: "json" }
import nightowl from "./themes/nightowl.json" with { type: "json" }
import nord from "./themes/nord.json" with { type: "json" }
import onedark from "./themes/one-dark.json" with { type: "json" }
import opencode from "./themes/opencode.json" with { type: "json" }
import orng from "./themes/orng.json" with { type: "json" }
import osakaJade from "./themes/osaka-jade.json" with { type: "json" }
import palenight from "./themes/palenight.json" with { type: "json" }
import rosepine from "./themes/rosepine.json" with { type: "json" }
import solarized from "./themes/solarized.json" with { type: "json" }
import synthwave84 from "./themes/synthwave84.json" with { type: "json" }
import tokyonight from "./themes/tokyonight.json" with { type: "json" }
import vercel from "./themes/vercel.json" with { type: "json" }
import vesper from "./themes/vesper.json" with { type: "json" }
import zenburn from "./themes/zenburn.json" with { type: "json" }

type HexColor = `#${string}`
type Variant = { dark: HexColor | string; light: HexColor | string }
type ColorValue = HexColor | string | Variant
type ThemeJson = {
  defs?: Record<string, string>
  theme: Record<string, ColorValue | number>
}

export const THEMES: Record<string, ThemeJson> = {
  aura,
  ayu,
  catppuccin,
  "catppuccin-frappe": catppuccinFrappe,
  "catppuccin-macchiato": catppuccinMacchiato,
  cobalt2,
  cursor,
  dracula,
  everforest,
  flexoki,
  github,
  gruvbox,
  kanagawa,
  material,
  matrix,
  mercury,
  monokai,
  nightowl,
  nord,
  "one-dark": onedark,
  "osaka-jade": osakaJade,
  opencode,
  orng,
  "lucent-orng": lucentOrng,
  palenight,
  rosepine,
  solarized,
  synthwave84,
  tokyonight,
  vesper,
  vercel,
  zenburn,
  carbonfox,
} as Record<string, ThemeJson>

// Resolved theme shape used throughout the viewer
export type ResolvedTheme = {
  primary: RGBA
  secondary: RGBA
  accent: RGBA
  error: RGBA
  warning: RGBA
  success: RGBA
  info: RGBA
  text: RGBA
  textMuted: RGBA
  background: RGBA
  backgroundPanel: RGBA
  backgroundElement: RGBA
  border: RGBA
  borderActive: RGBA
  borderSubtle: RGBA
  diffAdded: RGBA
  diffRemoved: RGBA
  diffContext: RGBA
  diffHunkHeader: RGBA
  diffHighlightAdded: RGBA
  diffHighlightRemoved: RGBA
  diffAddedBg: RGBA
  diffRemovedBg: RGBA
  diffContextBg: RGBA
  diffLineNumber: RGBA
  diffAddedLineNumberBg: RGBA
  diffRemovedLineNumberBg: RGBA
  selectedListItemText: RGBA
  backgroundMenu: RGBA
  syntaxComment: RGBA
  syntaxKeyword: RGBA
  syntaxFunction: RGBA
  syntaxVariable: RGBA
  syntaxString: RGBA
  syntaxNumber: RGBA
  syntaxType: RGBA
  syntaxOperator: RGBA
  syntaxPunctuation: RGBA
}

// Ported from opencode's resolveTheme (dark mode only — we don't try to detect light)
function resolveTheme(json: ThemeJson, mode: "dark" | "light" = "dark"): ResolvedTheme {
  const defs = json.defs ?? {}

  function resolveColor(c: unknown, chain: string[] = []): RGBA {
    if (c instanceof RGBA) return c
    if (typeof c === "string") {
      if (c === "transparent" || c === "none") return RGBA.fromInts(0, 0, 0, 0)
      if (c.startsWith("#")) return RGBA.fromHex(c)
      if (chain.includes(c)) throw new Error(`Circular color reference: ${[...chain, c].join(" -> ")}`)
      const next = defs[c] ?? (json.theme as Record<string, unknown>)[c]
      if (next === undefined) throw new Error(`Color reference "${c}" not found`)
      return resolveColor(next, [...chain, c])
    }
    if (typeof c === "number") return RGBA.fromInts(0, 0, 0) // ANSI codes unsupported for v1
    if (c && typeof c === "object" && (mode in (c as object))) {
      return resolveColor((c as Variant)[mode], chain)
    }
    return RGBA.fromInts(0, 0, 0)
  }

  const resolved: Partial<ResolvedTheme> = {}
  for (const [key, value] of Object.entries(json.theme)) {
    if (key === "thinkingOpacity") continue
    if (key === "selectedListItemText" || key === "backgroundMenu") continue
    ;(resolved as Record<string, RGBA>)[key] = resolveColor(value)
  }

  resolved.selectedListItemText =
    json.theme.selectedListItemText !== undefined
      ? resolveColor(json.theme.selectedListItemText)
      : (resolved.background ?? RGBA.fromInts(0, 0, 0))
  resolved.backgroundMenu =
    json.theme.backgroundMenu !== undefined
      ? resolveColor(json.theme.backgroundMenu)
      : (resolved.backgroundElement ?? RGBA.fromInts(0, 0, 0))

  return resolved as ResolvedTheme
}

// Load custom themes from opencode's config locations:
//   - $XDG_CONFIG_HOME/opencode/themes/*.json (global)
//   - walks up from cwd for .opencode/themes/*.json (project)
// Mirrors opencode's getCustomThemes() lookup, sync version.
function loadCustomThemes(): Record<string, ThemeJson> {
  const fs = require("node:fs") as typeof import("node:fs")
  const path = require("node:path") as typeof import("node:path")
  const result: Record<string, ThemeJson> = {}
  const dirs: string[] = []

  const configDir = process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config")
  dirs.push(path.join(configDir, "opencode"))

  // Walk up from cwd looking for .opencode/
  let cur = process.cwd()
  while (true) {
    dirs.push(path.join(cur, ".opencode"))
    const parent = path.dirname(cur)
    if (parent === cur) break
    cur = parent
  }

  for (const dir of dirs) {
    const themesDir = path.join(dir, "themes")
    if (!fs.existsSync(themesDir)) continue
    for (const entry of fs.readdirSync(themesDir)) {
      if (!entry.endsWith(".json")) continue
      const name = entry.slice(0, -5)
      const raw = (() => {
        try {
          return fs.readFileSync(path.join(themesDir, entry), "utf-8")
        } catch {
          return null
        }
      })()
      if (!raw) continue
      const parsed = (() => {
        try {
          return JSON.parse(raw)
        } catch {
          return null
        }
      })()
      if (parsed && typeof parsed === "object" && "theme" in parsed) {
        result[name] = parsed as ThemeJson
      }
    }
  }
  return result
}

const CUSTOM_THEMES = loadCustomThemes()
// Merge custom themes into the registry. Custom themes override defaults if names collide.
Object.assign(THEMES, CUSTOM_THEMES)

// Synchronous KV read at startup (Bun.file().text() is async, so use the sync fs read).
function readOpencodeThemeSync(): string {
  try {
    const stateDir = process.env.XDG_STATE_HOME ?? join(homedir(), ".local", "state")
    const kvPath = join(stateDir, "opencode", "kv.json")
    const fs = require("node:fs") as typeof import("node:fs")
    if (!fs.existsSync(kvPath)) return "opencode"
    const raw = fs.readFileSync(kvPath, "utf-8")
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const value = parsed.theme
    if (typeof value !== "string") return "opencode"
    if (value === "system") return "opencode" // we don't generate the system theme
    return value in THEMES ? value : "opencode"
  } catch {
    return "opencode"
  }
}

// Active theme name signal — drives reactivity throughout the app.
// Wrapped in createRoot because we create these at module scope (outside the render tree)
// and they live for the lifetime of the process. createRoot prevents Solid's warning.
const { activeName, setActiveName, resolved } = createRoot(() => {
  const [activeName, setActiveName] = createSignal(readOpencodeThemeSync())
  const resolved = createMemo(() => {
    const json = THEMES[activeName()] ?? THEMES.opencode
    return resolveTheme(json!, "dark")
  })
  return { activeName, setActiveName, resolved }
})

export function getActiveThemeName() {
  return activeName()
}

export function setActiveTheme(name: string) {
  if (!(name in THEMES)) return false
  setActiveName(name)
  persistTheme(name)
  return true
}

export function listThemeNames(): string[] {
  return Object.keys(THEMES).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
}

function persistTheme(name: string) {
  try {
    const fs = require("node:fs") as typeof import("node:fs")
    const path = require("node:path") as typeof import("node:path")
    const stateDir = process.env.XDG_STATE_HOME ?? path.join(homedir(), ".local", "state")
    const dir = path.join(stateDir, "opencode")
    const kvPath = path.join(dir, "kv.json")
    fs.mkdirSync(dir, { recursive: true })
    let current: Record<string, unknown> = {}
    if (fs.existsSync(kvPath)) {
      const raw = fs.readFileSync(kvPath, "utf-8")
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === "object") current = parsed as Record<string, unknown>
    }
    current.theme = name
    const tmp = `${kvPath}.${process.pid}.${Date.now()}.tmp`
    fs.writeFileSync(tmp, JSON.stringify(current, null, 2))
    fs.renameSync(tmp, kvPath)
  } catch {
    // Best effort — failing to persist shouldn't break the viewer.
  }
}

// Single shared SyntaxStyle instance (opencode regenerates per theme; we keep it simple).
export const syntax = SyntaxStyle.create()

// Compatibility shim matching the prior API ({ theme, syntax }).
// `theme` is a Proxy so consumers like `theme()` work without breaking.
export function useTheme() {
  return {
    theme: new Proxy({} as ResolvedTheme, {
      get(_target, prop) {
        return (resolved() as unknown as Record<string, unknown>)[prop as string]
      },
    }),
    syntax,
  }
}

export function tint(fg: RGBA, bg: RGBA, alpha: number): RGBA {
  const r = Math.round(bg.r * 255 * (1 - alpha) + fg.r * 255 * alpha)
  const g = Math.round(bg.g * 255 * (1 - alpha) + fg.g * 255 * alpha)
  const b = Math.round(bg.b * 255 * (1 - alpha) + fg.b * 255 * alpha)
  return RGBA.fromInts(r, g, b)
}

// Re-export for direct access if needed.
export const theme = new Proxy({} as ResolvedTheme, {
  get(_target, prop) {
    return (resolved() as unknown as Record<string, unknown>)[prop as string]
  },
})
