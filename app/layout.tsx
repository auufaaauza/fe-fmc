import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider, Toaster } from "@/components/ui/toast";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Find My Career",
  description: "Sistem pendukung keputusan rekomendasi program studi dengan metode SAW",
  icons: {
    icon: "/image/logo.png",
    apple: "/image/logo.png"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ToastProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
