// Inline message box for form errors and notices.
import { CircleAlert, CircleCheck } from "lucide-react";
import type { ReactNode } from "react";

type Props = { tone?: "error" | "success"; children: ReactNode };

export function Alert({ tone = "error", children }: Props) {
  const Icon = tone === "error" ? CircleAlert : CircleCheck;
  return (
    <div className={`alert alert--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon size={18} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
