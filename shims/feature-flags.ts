/**
 * Feature-flag configuration for the Forge Code build.
 *
 * Each `feature('FLAG')` call in the source is rewritten at build time to the
 * boolean literal mapped here. Enabling a flag keeps its gated code path in
 * the bundle; disabling it lets Bun dead-code-eliminate the branch (and any
 * `require()` it guards).
 *
 * IMPORTANT REALITY: the source map only contains files that were bundled into
 * `cli.js` in Anthropic's original build. Their build had most of these flags
 * OFF, so the gated subsystems were never bundled and are NOT in the source
 * map. Enabling such a flag makes Bun try to resolve modules that don't exist
 * here — the build fails. Those flags are marked OFF below with the missing
 * module. Re-enabling them would require re-implementing the whole subsystem.
 *
 * To experiment: flip an OFF flag to true and run `bun run build.ts` — the build
 * reports any newly-required missing module. Stub it, or turn the flag back off.
 */
export const FEATURE_FLAGS: Record<string, boolean> = {
  // ╭───────────────────────────────────────────────────────────────────────╮
  // │ ON — code present in the source map or stubbed; builds & runs cleanly. │
  // ╰───────────────────────────────────────────────────────────────────────╯

  // Coding-relevant capabilities (modules present):
  AGENT_TRIGGERS: true, // cron scheduling tools (ScheduleCronTool present)
  EXTRACT_MEMORIES: true, // memory extraction (module present)
  ULTRAPLAN: true, // ultraplan command (prompt.txt stubbed)

  // UI affordances (inline logic, deps present):
  MESSAGE_ACTIONS: true, // message action menu
  HISTORY_PICKER: true, // history session picker
  QUICK_SEARCH: true, // quick search UI
  TOKEN_BUDGET: true, // token budget display
  COMPACTION_REMINDERS: true, // compaction reminder UI
  STREAMLINED_OUTPUT: true, // streamlined output mode

  // Inline behavior toggles (no missing-module requires):
  ULTRATHINK: true, // ultrathink mode
  UNATTENDED_RETRY: true, // unattended retry logic
  PROMPT_CACHE_BREAK_DETECTION: true, // prompt cache break detection
  SLOW_OPERATION_LOGGING: true, // slow op logging
  SHOT_STATS: true, // shot stats
  HARD_FAIL: true, // hard-fail mode
  DUMP_SYSTEM_PROMPT: true, // debug: dump system prompt
  SKIP_DETECTION_WHEN_AUTOUPDATES_DISABLED: true, // skip-detection logic
  ALLOW_TEST_VERSIONS: true, // allow test versions
  NEW_INIT: true, // new init flow
  BUILTIN_EXPLORE_PLAN_AGENTS: true, // built-in explore/plan agents
  VERIFICATION_AGENT: true, // verification agent
  BUILDING_CLAUDE_APPS: false, // bundled skill .md content missing
  POWERSHELL_AUTO_MODE: true, // powershell auto mode

  // Inline platform/telemetry toggles (degrade gracefully without backend):
  IS_LIBC_GLIBC: true, // libc detection (linux)
  IS_LIBC_MUSL: true, // libc detection (linux)
  COWORKER_TYPE_TELEMETRY: true, // telemetry field
  MEMORY_SHAPE_TELEMETRY: false, // memdir/memoryShapeTelemetry missing
  ENHANCED_TELEMETRY_BETA: true, // telemetry (no-op without backend)
  CONNECTOR_TEXT: true, // (connectorText stubbed — isConnectorTextBlock=false)
  FILE_PERSISTENCE: true, // (filePersistence types stubbed)
  MCP_RICH_OUTPUT: true, // rich MCP output rendering
  AWAY_SUMMARY: true, // away summary
  TEAMMEM: true, // teammate feature
  UPLOAD_USER_SETTINGS: true, // settings sync
  DOWNLOAD_USER_SETTINGS: true, // settings sync
  BREAK_CACHE_COMMAND: true, // break cache command

  // ╭───────────────────────────────────────────────────────────────────────╮
  // │ OFF — gated modules are MISSING from the source map (never bundled in │
  // │ Anthropic's original build). Enabling breaks the build.                │
  // ╰───────────────────────────────────────────────────────────────────────╯

  // Subsystem tools whose modules aren't in the source map:
  WORKFLOW_SCRIPTS: false, // WorkflowTool/* + commands/workflows missing
  HISTORY_SNIP: false, // SnipTool, snipProjection, commands/force-snip missing
  TERMINAL_PANEL: false, // TerminalCaptureTool missing
  EXPERIMENTAL_SKILL_SEARCH: false, // services/skillSearch/* missing
  SKILL_IMPROVEMENT: false, // skill-search-adjacent, deps missing
  RUN_SKILL_GENERATOR: false, // skill-search-adjacent, deps missing
  BASH_CLASSIFIER: false, // yolo-classifier-prompts/*.txt + SnipTool missing
  TRANSCRIPT_CLASSIFIER: false, // yolo-classifier-prompts/*.txt missing
  COORDINATOR_MODE: false, // coordinator/workerAgent missing
  FORK_SUBAGENT: false, // commands/fork missing
  TORCH: false, // commands/torch missing
  COMMIT_ATTRIBUTION: false, // attributionHooks/attributionTrailer missing
  AUTO_THEME: false, // utils/systemThemeWatcher missing
  REACTIVE_COMPACT: false, // services/compact/reactiveCompact missing
  CACHED_MICROCOMPACT: false, // services/compact/cachedMCConfig missing
  MCP_SKILLS: false, // skills/mcpSkills missing
  CONTEXT_COLLAPSE: false, // tools/CtxInspectTool missing (index stubbed)
  TREE_SITTER_BASH: false, // native tree-sitter, module missing
  TREE_SITTER_BASH_SHADOW: false, // native tree-sitter
  DIRECT_CONNECT: false, // server/* (cc:// connect path) missing

  // Separate entrypoints never bundled into cli.js:
  DAEMON: false, // daemon/* missing
  BG_SESSIONS: false, // cli/bg.js missing
  TEMPLATES: false, // cli/handlers/templateJobs.js missing
  BYOC_ENVIRONMENT_RUNNER: false, // environment-runner/main.js missing
  SELF_HOSTED_RUNNER: false, // self-hosted-runner/main.js missing

  // Anthropic-internal packages / services (not on npm / not reachable):
  KAIROS: false,
  KAIROS_CHANNELS: false,
  KAIROS_BRIEF: false,
  KAIROS_DREAM: false,
  KAIROS_GITHUB_WEBHOOKS: false,
  KAIROS_PUSH_NOTIFICATION: false,
  PROACTIVE: false, // proactive/index.ts missing
  MONITOR_TOOL: false, // MonitorTool missing
  AGENT_TRIGGERS_REMOTE: false, // remote infra
  AGENT_MEMORY_SNAPSHOT: false, // SnapshotUpdateDialog stubbed but needs more
  LODESTONE: false,
  CHICAGO_MCP: false,
  CCR_AUTO_CONNECT: false,
  CCR_MIRROR: false,
  CCR_REMOTE_SETUP: false,
  SSH_REMOTE: false,
  UDS_INBOX: false,
  BRIDGE_MODE: false,

  // Native binaries / platform-specific (unavailable on this build):
  VOICE_MODE: false, // audio-capture.node
  NATIVE_CLIPBOARD_IMAGE: false, // native clipboard
  WEB_BROWSER_TOOL: false, // @ant/computer-use native

  // Anthropic server attestation / research infra:
  NATIVE_CLIENT_ATTESTATION: false,
  PERFETTO_TRACING: false,
  ANTI_DISTILLATION_CC: false,
  ABLATION_BASELINE: false,
  OVERFLOW_TEST_TOOL: false,
};
