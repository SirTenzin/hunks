import { type ScrollAcceleration } from "@opentui/core"

// Mirror of opencode's CustomSpeedScroll (packages/opencode/src/cli/cmd/tui/util/scroll.ts).
// Every wheel/trackpad tick advances by a constant number of lines, so the
// trackpad scroll feel matches opencode's main session view.
export class CustomSpeedScroll implements ScrollAcceleration {
  constructor(private speed: number) {}

  tick(_now?: number): number {
    return this.speed
  }

  reset(): void {}
}
