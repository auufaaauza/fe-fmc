import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-[#FFFBF0]">
      <div className="nb-card max-w-md w-full p-8 text-center bg-white">
        <div className="inline-block nb-badge mb-3 bg-pink-300 text-sm">
          Error 404
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-sm font-bold text-gray-700 mb-6">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <Button asChild className="w-full">
          <Link href="/login">Kembali ke Halaman Utama</Link>
        </Button>
      </div>
    </main>
  );
}
