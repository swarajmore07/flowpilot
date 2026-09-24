/**
 * Operational signal tones. Colour here is load-bearing: it maps to a real
 * state (healthy / watch / breach), never to decoration.
 */
export type SignalTone =
  | "neutral"
  | "positive"
  | "caution"
  | "critical"
  | "brand";
