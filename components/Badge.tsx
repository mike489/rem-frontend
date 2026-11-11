// Small coloured label (status, role, purpose).
import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "success" | "warning" | "info" | "accent";

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
