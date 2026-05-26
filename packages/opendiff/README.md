# opendiff

Terminal diff viewer extracted from [opencode](https://github.com/anomalyco/opencode)'s `/diff` slash command. Renders git working-tree changes in a keyboard-navigable TUI with file tree sidebar, split/unified diff panes, and reviewed-state tracking.

## Install

Requires [Bun](https://bun.sh) (>= 1.0).

```sh
bun i -g opendiff
# or
npm i -g opendiff
```

## Usage

Run inside any git repository with uncommitted changes:

```sh
opendiff
```

No arguments, no config. It walks up from `cwd` to find `.git`, runs `git diff HEAD`, and opens the viewer.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `j`/`k` or `↑`/`↓` | Navigate up/down |
| `n`/`p` | Next/previous changed file |
| `tab`/`t` | Toggle focus between file tree and diff pane |
| `m` | Mark file as reviewed |
| `r` | Reload git diff |
| `v` | Toggle split/unified view |
| `s` | Toggle single-patch mode |
| `e` | Expand all directories |
| `h`/`l` or `←`/`→` | Collapse/expand directory |
| `q` or `Ctrl+C` | Quit |

## Architecture

- **Runtime**: Bun (TypeScript + JSX via `@opentui/solid`)
- **Renderer**: `@opentui/core` + `@opentui/solid` (terminal-native, no webview)
- **Diff parsing**: `git diff HEAD` via `node:child_process`
- **Vendored UI**: Four files adapted from opencode's TUI diff plugin

## License

MIT
