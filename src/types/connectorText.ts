// STUB: connector text blocks (CONNECTOR_TEXT feature). isConnectorTextBlock
// returns false so non-gated callers treat no blocks as connector text.
export interface ConnectorTextBlock {
  type: "connector_text";
  text: string;
  [k: string]: unknown;
}
export interface ConnectorTextDelta {
  type: "connector_text_delta";
  delta: string;
  [k: string]: unknown;
}
export function isConnectorTextBlock(_block: unknown): _block is ConnectorTextBlock {
  return false;
}
