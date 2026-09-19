// STUB: color-diff-napi native module (macOS). The TS color-diff port handles
// syntax highlighting in all build modes; the native module is only used when
// available. Provide callable no-op stubs so the import resolves on Windows.
export type SyntaxTheme = Record<string, unknown>;

export function ColorDiff(_input: unknown): string {
  return "";
}
export function ColorFile(_input: unknown): string {
  return "";
}
export function getSyntaxTheme(_themeName: string): SyntaxTheme | null {
  return null;
}
