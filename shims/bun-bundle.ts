// Shim for the `bun:bundle` compile-time module.
// The build plugin (build.ts) rewrites every `feature('FLAG')` call to `false`
// at build time for dead-code elimination. This runtime fallback is only hit
// by any `feature()` call the transform does not catch (e.g. dynamic args);
// it returns false so all feature-gated code paths stay disabled.
export function feature(_flag: string): boolean {
  return false;
}