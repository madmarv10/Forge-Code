# Forge Code

A buildable, runnable fork of the Claude Code CLI, reconstructed from the public
`@anthropic-ai/claude-code` npm package (v2.1.88) via its source map, with the
build machinery restored so it compiles with [Bun](https://bun.sh). Rebranded
**Forge Code** with a blue theme.

> [!WARNING]
> This repository is **unofficial** and is reconstructed from the public npm
> package and source map analysis, **for research and educational purposes
> only**. The source code copyright belongs to [Anthropic](https://www.anthropic.com).
> It does **not** represent Anthropic's original internal development repository
> structure. Do not use it for commercial purposes.

## What this is

The published `@anthropic-ai/claude-code` package ships a self-contained Bun
bundle (`cli.js`) together with its source map (`cli.js.map`, which embeds
`sourcesContent`). This repo takes the ~1,900 `.ts/.tsx` files recovered from
that source map and makes them **build and run** again — mirroring the approach
of [`yapjinkun/cc-compiled`](https://github.com/yapjinkun/cc-compiled), adapted
to this version.

### How the build works

The restored source depends on Anthropic-internal build-time machinery that has
no runtime definition:

- **`feature('FLAG')`** from `bun:bundle` — a compile-time dead-code-elimination
  macro (~88 flags across ~196 files). The `build.ts` plugin rewrites every
  `feature('LITERAL')` → `false` at build time, so gated subsystems (voice,
  KAIROS, buddy, coordinator, cron, computer-use, Chrome) drop out of the
  bundle graph.
- **`MACRO`** — a build-time-injected global (version, build time, URLs).
  Provided via `Bun.build` `define`.
- **`useEffectEvent`** — experimental React hook absent from stable React;
  polyfilled onto React's production build in `build.ts`.
- **`bun:bundle`** and the macOS-only native napi modules (`color-diff-napi`,
  `modifiers-napi`) — resolved to shims in `shims/`.
- Phone-home checks (`assertMinVersion`, `validateForceLoginOrg`) — bypassed so
  an API-key build never phones home or force-shuts-down.

Missing modules the source map didn't carry are stubbed under their expected
paths (see the `// STUB` comments).

## Prerequisites

- [Bun](https://bun.sh) (developed against 1.4.x)

## Run (prebuilt bundle)

A prebuilt bundle is included at `dist/bundle.js`.

```bash
cp .env.example .env      # fill in your API key + base URL
bun dist/bundle.js --version          # → 2.1.88 (Forge Code)
bun dist/bundle.js -p "say hello"      # one-shot mode
bun dist/bundle.js                    # interactive REPL
```

## Build from source

```bash
bun install
bun run build.ts          # → dist/bundle.js
```

> [!NOTE]
> A fresh `bun install` reproduces the **public** dependencies, but several
> packages the original bundle relied on are Anthropic-internal and not on npm
> (`@anthropic-ai/sandbox-runtime`, `@anthropic-ai/mcpb`, the `@ant/*`
> computer-use packages, `@pondwader/socks5-server`, the multi-cloud SDKs).
> Rebuilding from a clean checkout therefore requires vendoring those packages
> and adding the `package.json`/`exports` repairs — see `build.ts` and the
> `shims/` directory for what's needed. The prebuilt `dist/bundle.js` does not
> require this step.

## Configuration

See [`.env.example`](.env.example). The CLI talks to any Anthropic-compatible
endpoint; set `ANTHROPIC_API_KEY` and `ANTHROPIC_BASE_URL` to point it at
OpenRouter (or another provider). Your `.env` is gitignored — never commit it.

## Project layout

```
├── build.ts                # Bun build driver (DCE plugin, defines, shims)
├── package.json
├── tsconfig.json           # bundler resolution + src/* path alias
├── shims/                  # bun:bundle, MACRO types, native-napi stubs
├── src/                    # restored TypeScript source (~1,900 files)
│   ├── entrypoints/cli.tsx # bootstrap entrypoint
│   ├── main.tsx            # full CLI
│   ├── tools/  commands/  services/  utils/  components/  ink/  ...
└── dist/bundle.js          # prebuilt runnable bundle
```

## Attribution

The restored source code is © Anthropic. This repo exists for technical study of
how the CLI is built. All credit for the original implementation belongs to
Anthropic.
