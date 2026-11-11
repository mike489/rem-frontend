// Root layout: fonts, global styles, metadata. Page chrome lives in the route-group layouts:
//   app/(auth)/layout.tsx  -> sign-in / register screens
//   app/(app)/layout.tsx   -> signed-in app shell (sidebar + top bar)
import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

// Sans-serif for UI text; serif for page titles and the wordmark.
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: {
    default: "REM — Real Estate Management",
    template: "%s · REM",
  },
  description: "Real estate management and property operations platform.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
