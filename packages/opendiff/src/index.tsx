import { createCliRenderer } from "@opentui/core"
import { render } from "@opentui/solid"
import { App } from "./app"

const renderer = await createCliRenderer({
  externalOutputMode: "passthrough",
  targetFps: 60,
  exitOnCtrlC: true,
  useMouse: true,
  clearOnShutdown: true,
})

function exit() {
  renderer.destroy()
  process.exit(0)
}

process.on("SIGTERM", exit)
process.on("SIGINT", exit)

await render(() => <App onExit={exit} />, renderer)
exit()
