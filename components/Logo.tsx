// REM brand mark: amber icon tile + wordmark.
import { Building2 } from "lucide-react";

export function Logo() {
  return (
    <span className="logo">
      <span className="logo__mark" aria-hidden="true">
        <Building2 size={22} strokeWidth={2} />
      </span>
      <span className="logo__name">REM</span>
    </span>
  );
}
