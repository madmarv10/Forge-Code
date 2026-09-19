/**
 * Build driver for the restored Claude Code v2.1.88 source.
 *
 * Injects via Bun.build:
 *  - `define`: MACRO global; process.env.USER_TYPE / CLAUDE_CODE_VERIFY_PLAN so
 *    ant-only + verify-plan requires are DCE'd; NODE_ENV=production so React
 *    loads its production build.
 *  - `external`: lazy/cloud/native packages kept as runtime resolution.
 *  - `featureDcePlugin`: rewrites feature('FLAG')->false for DCE; resolves
 *    `bun:bundle` to a shim; loads .md as text; polyfills useEffectEvent onto
 *    React's production cjs (experimental hook absent from stable React).
 *
 * Usage: bun run build.ts
 */
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = import.meta.dir;
const SRC = resolve(ROOT, "src");

const MACRO_VALUE = {
  VERSION: "2.1.88",
  BUILD_TIME: "",
  PACKAGE_URL: "https://www.npmjs.com/package/@anthropic-ai/claude-code",
  NATIVE_PACKAGE_URL: "",
  VERSION_CHANGELOG: "",
  ISSUES_EXPLAINER: "",
  FEEDBACK_CHANNEL: "",
};

const FEATURE_CALL = /\bfeature\(\s*['"][A-Z_][A-Z_0-9]*['"]\s*\)/g;

const EXTERNAL = [
  "@aws-sdk/client-bedrock",
  "@aws-sdk/client-sts",
  "@azure/identity",
  "@opentelemetry/exporter-*",
  "@pondwader/socks5-server",
  "sharp",
  // Multi-cloud SDKs (vendored, incomplete transitive deps) + their native helpers.
  "@anthropic-ai/bedrock-sdk",
  "@anthropic-ai/foundry-sdk",
  "@anthropic-ai/vertex-sdk",
  "@anthropic-ai/mcpb",
];

// useEffectEvent polyfill appended to React's production cjs build.
const REACT_PATCH = `
// --- COMPILED BUILD: polyfill useEffectEvent (experimental, absent from stable React) ---
exports.useEffectEvent = function useEffectEvent(fn) {
  var ref = exports.useRef(fn);
  ref.current = fn;
  return exports.useMemo(function () {
    return function () {
      var args = arguments;
      return ref.current.apply(this, args);
    };
  }, []);
};
`;

const featureDcePlugin = {
  name: "feature-dce",
  setup(build: any) {
    build.onResolve({ filter: /^bun:bundle$/ }, () => ({
      path: resolve(ROOT, "shims/bun-bundle.ts"),
    }));

    // Resolve macOS-only native napi modules to no-op stubs.
    build.onResolve({ filter: /^color-diff-napi$/ }, () => ({
      path: resolve(ROOT, "shims/color-diff-napi.ts"),
    }));
    build.onResolve({ filter: /^modifiers-napi$/ }, () => ({
      path: resolve(ROOT, "shims/modifiers-napi.ts"),
    }));

    // .md / .txt files -> default-export string.
    build.onLoad({ filter: /\.md$|\.txt$/ }, async (args: any) => ({
      contents: `export default ${JSON.stringify(await Bun.file(args.path).text())}`,
      loader: "js",
    }));

    // One handler for all ts/tsx/js(x)/mjs: patch React cjs, transform src, else defer.
    build.onLoad({ filter: /\.[mc]?[tj]sx?$/ }, async (args: any) => {
      // Polyfill useEffectEvent onto React's production build.
      if (/react[\\/]cjs[\\/]react\.production\.js$/.test(args.path)) {
        const input = await Bun.file(args.path).text();
        if (!input.includes("useEffectEvent")) {
          return { contents: input + REACT_PATCH, loader: "js" };
        }
        return undefined;
      }
      // Transform source files only: feature() -> false for DCE.
      if (args.path.startsWith(SRC)) {
        const input = await Bun.file(args.path).text();
        if (input.includes("feature(")) {
          const transformed = input.replace(FEATURE_CALL, "false");
          const loader = args.path.endsWith(".tsx")
            ? "tsx"
            : args.path.endsWith(".jsx")
              ? "jsx"
              : args.path.endsWith(".ts") || args.path.endsWith(".mts") || args.path.endsWith(".cts")
                ? "ts"
                : "js";
          return { contents: transformed, loader };
        }
      }
      return undefined;
    });
  },
};

const result = await Bun.build({
  entrypoints: [resolve(SRC, "entrypoints/cli.tsx")],
  outdir: resolve(ROOT, "dist"),
  target: "bun",
  format: "esm",
  splitting: false,
  minify: false,
  sourcemap: "external",
  naming: "bundle.js",
  external: EXTERNAL,
  define: {
    MACRO: JSON.stringify(MACRO_VALUE),
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env.USER_TYPE": JSON.stringify("external"),
    "process.env.CLAUDE_CODE_VERIFY_PLAN": JSON.stringify("false"),
  },
  plugins: [featureDcePlugin],
});

if (!result.success) {
  console.error(`\nBuild failed: ${result.logs.length} error(s)\n`);
  for (const log of result.logs) console.error(String(log));
  process.exit(1);
}

// Single entrypoint => one .js output (named bundle.js via `naming`). Only
// concatenate if Bun emitted multiple .js chunks; otherwise the .js is already
// at dist/bundle.js and we just drop the extra sourcemap from the outputs list.
const jsOutputs = result.outputs.filter((o) => o.path.endsWith(".js"));
if (jsOutputs.length > 1) {
  const parts = jsOutputs.map((o) => o.path);
  const combined = await Promise.all(parts.map((p) => Bun.file(p).text()));
  await Bun.write(resolve(ROOT, "dist/bundle.js"), combined.join("\n"));
  for (const p of parts.slice(1)) if (existsSync(p)) await rm(p, { force: true });
} else if (jsOutputs.length === 1 && jsOutputs[0]!.path !== resolve(ROOT, "dist/bundle.js")) {
  await rm(resolve(ROOT, "dist/bundle.js"), { force: true });
  const { rename } = await import("node:fs/promises");
  await rename(jsOutputs[0]!.path, resolve(ROOT, "dist/bundle.js"));
}

console.error(`\nBuild OK: ${result.outputs.length} output(s). Entry: dist/bundle.js`);
