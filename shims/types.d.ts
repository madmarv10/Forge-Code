// Ambient declarations for build-time / internal constructs that have no
// resolvable TypeScript source. Used for type-checking only; Bun transpile
// erases type-only imports.

// --- bun:bundle feature-flag macro (resolved to shims/bun-bundle.ts by the build plugin) ---
declare module "bun:bundle" {
  export function feature(flag: string): boolean;
}

// --- MACRO global (define-time injected by Bun.build `define`) ---
declare const MACRO: {
  VERSION: string;
  BUILD_TIME: string;
  PACKAGE_URL: string;
  NATIVE_PACKAGE_URL: string;
  VERSION_CHANGELOG: string;
  ISSUES_EXPLAINER: string;
  FEEDBACK_CHANNEL: string;
};

// --- React: useEffectEvent is experimental and absent from stock @types/react ---
declare module "react" {
  export function useEffectEvent<T extends (...args: never[]) => unknown>(fn: T): T;
}

// --- @anthropic-ai/claude-agent-sdk: type-only import at cli/print.ts:130 ---
declare module "@anthropic-ai/claude-agent-sdk" {
  export type PermissionMode = "default" | "acceptEdits" | "plan" | "bypassPermissions";
}

// --- @ant/* internal packages: type-only imports (runtime usage is DCE'd when flags off) ---
declare module "@ant/computer-use-mcp/types" {
  export interface CuPermissionRequest {
    [key: string]: unknown;
  }
  export interface CuPermissionResponse {
    [key: string]: unknown;
  }
  export const DEFAULT_GRANT_FLAGS: Record<string, boolean>;
}

declare module "@ant/computer-use-mcp/sentinelApps" {
  export function getSentinelCategory(name: string): string | undefined;
}

declare module "@ant/computer-use-swift" {
  export type ComputerUseAPI = unknown;
}

declare module "@ant/claude-for-chrome-mcp" {
  export const __stub: true;
}
