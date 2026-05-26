/** @jsxImportSource @opentui/solid */
import { createResource, Show } from "solid-js"
import { DiffViewer } from "./diff-viewer/diff-viewer"
import { getGitDiffs } from "./git"

export function App(props: { onExit: () => void }) {
  const [diffs, { refetch }] = createResource(() => getGitDiffs(process.cwd()))

  return (
    <Show when={diffs()} fallback={<text>Loading diff...</text>}>
      {(resolved) => <DiffViewer diffs={resolved()} onExit={props.onExit} onReload={refetch} />}
    </Show>
  )
}
