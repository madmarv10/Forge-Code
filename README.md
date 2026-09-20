# Forge Code

**Forge** is a terminal-based AI coding harness — an interactive agent that
runs in your shell, reads and edits files, runs commands, searches your
codebase, and drives multi-step engineering tasks. It is a buildable, runnable
fork of the Claude Code CLI, reconstructed from the public
`@anthropic-ai/claude-code` npm package (v2.1.88) via its source map, with the
build machinery restored so it compiles with [Bun](https://bun.sh). The whole
thing ships as a single `bundle.js` you launch from the command line.

Instead of talking to Anthropic directly, Forge is configured to route its
model calls through **[OpenRouter](https://openrouter.ai)** — point the harness
at OpenRouter's endpoint, set your OpenRouter API key, and pick any model
OpenRouter exposes (e.g. `z-ai/glm-5.2`, `anthropic/claude-sonnet-4.5`). Forge
speaks the Anthropic Messages API on the inside; OpenRouter translates that to
whatever backend provider you select.

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

## Feature flags

The source uses a `feature('FLAG')` compile-time macro for dead-code elimination
(~88 flags across ~196 files). `shims/feature-flags.ts` maps each flag to a
boolean that the build plugin inlines. The **core agent loop is not
feature-flagged** — the full tool set (Bash, Read, Write, Edit, Glob, Grep,
WebFetch, WebSearch, Agent, Skill, Task*, TodoWrite, NotebookEdit, MCP, LSP,
PowerShell, AskUserQuestion), **plan mode** (EnterPlanMode/ExitPlanMode), the
interactive Ink TUI, 80+ slash commands, and the query engine are always on.

### Enabled (34 flags)

Cron scheduling (`AGENT_TRIGGERS`), memory extraction (`EXTRACT_MEMORIES`),
ultraplan (`ULTRAPLAN`), ultrathink (`ULTRATHINK`), the built-in explore/plan
and verification agents (`BUILTIN_EXPLORE_PLAN_AGENTS`, `VERIFICATION_AGENT`),
history picker, message actions, quick search, token budget, compaction
reminders, MCP rich output, away summary, teammate features, new init flow,
PowerShell auto mode, and a set of inline behavior/telemetry toggles. See
`shims/feature-flags.ts` for the full list.

### Unavailable subsystems (disabled)

These are off because their source is **not in the source map** — Anthropic's
original build had the flag off, so the gated code was never bundled into
`cli.js` and wasn't recoverable. Enabling them makes the build look for files
that don't exist here; re-enabling would require re-implementing the subsystem.
You can flip any to `true` in `shims/feature-flags.ts` and run `bun run build.ts`
to see exactly what's missing.

**Source missing from the leak:**

| Flag | Subsystem | Missing module(s) |
|---|---|---|
| `WORKFLOW_SCRIPTS` | Multi-agent workflow tool | `tools/WorkflowTool/*` internals |
| `COORDINATOR_MODE` | Multi-agent coordinator | `coordinator/workerAgent.js` |
| `FORK_SUBAGENT` | Subagent forking | `commands/fork/*` |
| `TORCH` | Torch command | `commands/torch.js` |
| `COMMIT_ATTRIBUTION` | PR trailers on squash commits | `attributionHooks.js`, `attributionTrailer.js` |
| `HISTORY_SNIP` | History snip tool | `SnipTool/*`, `commands/force-snip.js` |
| `BASH_CLASSIFIER` | Bash auto-approve classifier | `yolo-classifier-prompts/*.txt` |
| `TRANSCRIPT_CLASSIFIER` | Transcript classifier | `yolo-classifier-prompts/*.txt` |
| `EXPERIMENTAL_SKILL_SEARCH` | Skill search | `services/skillSearch/*` |
| `SKILL_IMPROVEMENT` | Skill improvement | skill-search-adjacent deps |
| `RUN_SKILL_GENERATOR` | Skill generation | skill-search-adjacent deps |
| `MCP_SKILLS` | MCP-backed skills | `skills/mcpSkills.js` |
| `CONTEXT_COLLAPSE` | Context-span collapse | `tools/CtxInspectTool/*` |
| `TERMINAL_PANEL` | Terminal panel UI | `tools/TerminalCaptureTool/*` |
| `REACTIVE_COMPACT` | Reactive compaction | `services/compact/reactiveCompact.js` |
| `CACHED_MICROCOMPACT` | Cached microcompaction | `services/compact/cachedMCConfig.js` |
| `AUTO_THEME` | OS theme watcher | `utils/systemThemeWatcher.js` |
| `TREE_SITTER_BASH` / `_SHADOW` | Bash AST parsing | native tree-sitter module |
| `BUILDING_CLAUDE_APPS` | "Building Claude apps" skill | ~24 bundled skill `.md` files |
| `MEMORY_SHAPE_TELEMETRY` | Memory telemetry | `memdir/memoryShapeTelemetry.js` |

**Separate entrypoints (never bundled into `cli.js`):**

| Flag | Subsystem | Missing module(s) |
|---|---|---|
| `DAEMON` | Long-running supervisor | `daemon/*` |
| `BG_SESSIONS` | `claude ps/logs/attach/kill`, `--bg` | `cli/bg.js` |
| `TEMPLATES` | Template job runner | `cli/handlers/templateJobs.js` |
| `BYOC_ENVIRONMENT_RUNNER` | Headless BYOC runner | `environment-runner/main.js` |
| `SELF_HOSTED_RUNNER` | Self-hosted runner | `self-hosted-runner/main.js` |
| `DIRECT_CONNECT` | `cc://` connect-to-server | `server/*` |

**Anthropic-internal packages / services (not reachable from outside Anthropic):**

| Flag | Subsystem |
|---|---|
| `PROACTIVE` | Proactive mode (`proactive/index.ts` missing) |
| `MONITOR_TOOL` | Monitor tool (`MonitorTool` missing) |
| `KAIROS` / `KAIROS_CHANNELS` / `KAIROS_BRIEF` / `KAIROS_DREAM` / `KAIROS_GITHUB_WEBHOOKS` / `KAIROS_PUSH_NOTIFICATION` | KAIROS assistant infrastructure + tools |
| `AGENT_TRIGGERS_REMOTE` | Remote trigger infrastructure |
| `LODESTONE` | Internal service |
| `CHICAGO_MCP` | Internal MCP |
| `CCR_AUTO_CONNECT` / `CCR_MIRROR` / `CCR_REMOTE_SETUP` | Claude Code Remote (internal) |
| `SSH_REMOTE` / `UDS_INBOX` / `BRIDGE_MODE` | Remote/socket infrastructure |
| `AGENT_MEMORY_SNAPSHOT` | Memory snapshot (needs more than stubbed dialog) |

**Native binaries / platform / Anthropic servers:**

| Flag | Subsystem | Why blocked |
|---|---|---|
| `VOICE_MODE` | Voice interaction | `audio-capture.node` native binary |
| `NATIVE_CLIPBOARD_IMAGE` | Clipboard image support | native clipboard module |
| `WEB_BROWSER_TOOL` | Web browser tool | `@ant/computer-use` native packages |
| `NATIVE_CLIENT_ATTESTATION` | Client attestation | Anthropic attestation server |
| `PERFETTO_TRACING` | Perfetto tracing | tracing infrastructure |
| `ANTI_DISTILLATION_CC` | Anti-distillation | Anthropic server |
| `ABLATION_BASELINE` / `OVERFLOW_TEST_TOOL` | Internal research tooling | research infra |

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
