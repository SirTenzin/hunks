import { createSolidTransformPlugin } from "@opentui/solid/bun-plugin"

const result = await Bun.build({
  entrypoints: ["bin/hunks.ts"],
  outdir: "dist",
  target: "bun",
  conditions: ["browser"],
  external: ["@opentui/core"],
  plugins: [createSolidTransformPlugin()],
})

if (!result.success) {
  for (const log of result.logs) {
    console.error(log)
  }
  process.exit(1)
}

console.log("Build complete")
