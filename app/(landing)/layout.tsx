import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";

export const metadata: Metadata = {
  title: "Find My Career — Temukan Program Studi yang Tepat",
  description: "Sistem rekomendasi program studi berbasis nilai rapor dan minat karir RIASEC dengan metode SAW. Studi kasus SMAN 18 Garut.",
};

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
