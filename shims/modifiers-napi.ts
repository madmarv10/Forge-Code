// STUB: modifiers-napi native module (macOS-only). Callers guard with
// process.platform !== 'darwin' so these are never reached on Windows.
export function prewarm(): void {}
export function isModifierPressed(_modifier: string): boolean {
  return false;
}
