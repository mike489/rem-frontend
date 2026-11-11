// Layout for sign-in / register: one centered card on the sage background.
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth">
      <div className="auth__card">
        <Logo />
        {children}
      </div>
    </main>
  );
}
