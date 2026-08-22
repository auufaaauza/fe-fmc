"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-[#FFFBF0]">
      <div className="nb-card max-w-md w-full p-8 text-center bg-white">
        <div className="inline-block nb-badge mb-3 bg-red-400 text-sm">
          Terjadi Kesalahan
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
          Oops, Terjadi Masalah
        </h1>
        <p className="text-sm font-bold text-gray-700 mb-6">
          {error?.message || "Terjadi kesalahan saat memuat halaman."}
        </p>
        <Button onClick={() => reset()} className="w-full">
          Coba Lagi
        </Button>
      </div>
    </main>
  );
}
