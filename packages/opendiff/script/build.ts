import { createSolidTransformPlugin } from "@opentui/solid/bun-plugin"

const result = await Bun.build({
  entrypoints: ["bin/opendiff.ts"],
  outdir: "dist",
  target: "bun",
  packages: "external",
  plugins: [createSolidTransformPlugin()],
})

if (!result.success) {
  for (const log of result.logs) {
    console.error(log)
  }
  process.exit(1)
}

console.log("Build complete")
