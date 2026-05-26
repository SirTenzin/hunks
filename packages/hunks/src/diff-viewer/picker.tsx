/** @jsxImportSource @opentui/solid */
import { RGBA, ScrollBoxRenderable, TextAttributes, type InputRenderable } from "@opentui/core"
import { useTerminalDimensions, useKeyboard } from "@opentui/solid"
import * as fuzzysort from "fuzzysort"
import { batch, createEffect, createMemo, createSignal, For, on, Show } from "solid-js"
import { useTheme } from "../theme"
import { CustomSpeedScroll } from "./scroll-accel"

export interface PickerOption {
  title: string
  value: string
}

export interface PickerProps {
  title: string
  options: PickerOption[]
  current?: string
  onMove?: (option: PickerOption) => void
  onSelect: (option: PickerOption) => void
  onClose: () => void
}

// Picker — a 1:1-ish port of opencode's `DialogSelect`:
//   - full-screen translucent backdrop (closes on click)
//   - top-quarter centered dialog box on theme.backgroundPanel
//   - "Title" + "esc" header row
//   - <input> search field with fuzzy filtering
//   - scrollable option list with current-theme `●` marker
//   - active option painted with theme.primary background
export function Picker(props: PickerProps) {
  const dimensions = useTerminalDimensions()
  const { theme } = useTheme()

  const [filterText, setFilterText] = createSignal("")
  const [selected, setSelected] = createSignal(0)

  // Keep selected aligned with `current` when the picker mounts/filter clears.
  createEffect(
    on(
      () => props.current,
      (current) => {
        if (!current) return
        const idx = filtered().findIndex((o) => o.value === current)
        if (idx >= 0) setSelected(idx)
      },
    ),
  )

  const filtered = createMemo(() => {
    const needle = filterText().toLowerCase()
    if (!needle) return props.options
    const result = fuzzysort.go(needle, props.options, { key: "title" }).map((r) => r.obj)
    return result
  })

  // When the filter changes, jump selection to the first match so onMove can preview it.
  createEffect(
    on(filterText, () => {
      setSelected(0)
      const first = filtered()[0]
      if (first) props.onMove?.(first)
    }),
  )

  let scroll: ScrollBoxRenderable | undefined
  let input: InputRenderable | undefined

  function moveTo(next: number) {
    const list = filtered()
    if (list.length === 0) return
    let n = next
    if (n < 0) n = list.length - 1
    if (n >= list.length) n = 0
    setSelected(n)
    const option = list[n]
    if (option) props.onMove?.(option)
    if (!scroll) return
    // Scroll selected into view (mirrors opencode's per-id child lookup).
    const target = scroll.getChildren().find((c) => c.id === JSON.stringify(option?.value))
    if (!target) return
    const y = target.y - scroll.y
    if (y >= scroll.height) scroll.scrollBy(y - scroll.height + 1)
    else if (y < 0) scroll.scrollBy(y)
  }

  const scrollAccel = new CustomSpeedScroll(3)

  // Keyboard handling lives inside the picker so it stays self-contained and
  // automatically detaches when the parent unmounts the component.
  useKeyboard((event) => {
    const key = event.name
    if (key === "escape") {
      props.onClose()
      return
    }
    if (key === "return") {
      const option = filtered()[selected()]
      if (option) props.onSelect(option)
      return
    }
    // Arrow keys navigate; typing characters falls through to the focused <input>.
    // We intentionally do NOT use j/k here because they'd conflict with typing
    // in the search field.
    if (key === "down") {
      moveTo(selected() + 1)
      return
    }
    if (key === "up") {
      moveTo(selected() - 1)
      return
    }
  })

  // Dialog body width follows opencode "medium" size (60 columns) but constrained to terminal.
  const dialogWidth = () => Math.min(60, Math.max(30, dimensions().width - 4))

  // Wire input ref and auto-focus so typing immediately filters.
  function attachInput(el: InputRenderable) {
    input = el
    setTimeout(() => {
      if (!input || input.isDestroyed) return
      input.focus()
    }, 1)
  }

  return (
    <box
      position="absolute"
      zIndex={3000}
      left={0}
      top={0}
      width={dimensions().width}
      height={dimensions().height}
      alignItems="center"
      paddingTop={Math.floor(dimensions().height / 4)}
      backgroundColor={RGBA.fromInts(0, 0, 0, 150)}
      onMouseUp={() => props.onClose()}
    >
      <box
        width={dialogWidth()}
        backgroundColor={theme.backgroundPanel}
        paddingTop={1}
        paddingBottom={1}
        gap={1}
        onMouseUp={(e: { stopPropagation(): void }) => e.stopPropagation()}
      >
        <box paddingLeft={4} paddingRight={4}>
          <box flexDirection="row" justifyContent="space-between">
            <text fg={theme.text} attributes={TextAttributes.BOLD}>
              {props.title}
            </text>
            <text fg={theme.textMuted} onMouseUp={() => props.onClose()}>
              esc
            </text>
          </box>
        </box>
        <box paddingLeft={4} paddingRight={4}>
          <input
            onInput={(value: string) => batch(() => setFilterText(value))}
            focusedBackgroundColor={theme.backgroundPanel}
            cursorColor={theme.primary}
            focusedTextColor={theme.textMuted}
            ref={attachInput}
            placeholder="Search"
            placeholderColor={theme.textMuted}
          />
        </box>
        <Show
          when={filtered().length > 0}
          fallback={
            <box paddingLeft={4} paddingRight={4}>
              <text fg={theme.textMuted}>No results found</text>
            </box>
          }
        >
          <scrollbox
            paddingLeft={1}
            paddingRight={1}
            scrollbarOptions={{ visible: false }}
            scrollAcceleration={scrollAccel}
            ref={(r: ScrollBoxRenderable) => {
              scroll = r
            }}
            maxHeight={Math.min(filtered().length, Math.floor(dimensions().height / 2) - 6)}
          >
            <For each={filtered()}>
              {(option, index) => {
                const active = () => index() === selected()
                const current = () => option.value === props.current
                return (
                  <box
                    id={JSON.stringify(option.value)}
                    flexDirection="row"
                    backgroundColor={active() ? theme.primary : RGBA.fromInts(0, 0, 0, 0)}
                    paddingLeft={current() ? 1 : 3}
                    paddingRight={3}
                    gap={1}
                    onMouseUp={() => props.onSelect(option)}
                    onMouseMove={() => setSelected(index())}
                  >
                    <Show when={current()}>
                      <text fg={active() ? theme.selectedListItemText : theme.primary}>●</text>
                    </Show>
                    <text
                      fg={active() ? theme.selectedListItemText : current() ? theme.primary : theme.text}
                      attributes={active() ? TextAttributes.BOLD : undefined}
                      wrapMode="none"
                    >
                      {option.title}
                    </text>
                  </box>
                )
              }}
            </For>
          </scrollbox>
        </Show>
      </box>
    </box>
  )
}

// Expose move + submit handlers so the parent diff-viewer's useKeyboard can drive
// the picker without us setting up an independent listener layer.
export function pickerKeyHandler(opts: {
  state: { selected: number; setSelected: (n: number) => void; filtered: PickerOption[] }
  onSelect: (o: PickerOption) => void
  onClose: () => void
}) {
  return opts
}
