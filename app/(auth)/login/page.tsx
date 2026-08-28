"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, KeyRound, Lock, User } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(identifier, password);
      toast({ title: "Login Berhasil", description: "Selamat datang kembali di Find My Career.", type: "success" });
    } catch (error: any) {
      toast({
        title: "Login Gagal",
        description: error.appMessage || "NISN/Email atau password yang Anda masukkan salah.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:py-12 bg-slate-50">
      <section className="nb-card relative z-10 w-full max-w-md p-6 sm:p-8 bg-white border border-slate-200 shadow-sm rounded-2xl transition-all">
        {/* ── Brand Header (Logo -> Nama Brand -> Judul Login) ── */}
        <div className="mb-6 flex flex-col items-center text-center">
          {/* Logo container yang jelas & menonjol */}
          <div className="mb-3.5 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-indigo-50/80 border border-indigo-100 shadow-sm p-3 transition-transform hover:scale-105">
            <Image
              src="/image/logo.png"
              alt="Logo Find My Career"
              width={96}
              height={96}
              className="h-full w-full object-contain drop-shadow-sm"
              priority
            />
          </div>

          {/* Nama Brand */}
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Find My Career
          </h2>
          <p className="text-[11px] font-medium uppercase tracking-wider text-indigo-600 mt-0.5">
            Sistem Rekomendasi Karir & Penjurusan
          </p>

          {/* Pemisah Halus */}
          <div className="my-3 w-12 h-0.5 bg-slate-200 rounded-full" />

          {/* Judul Login */}
          <h1 className="text-base font-semibold text-slate-800">
            Masuk ke Akun Anda
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xs">
            Gunakan NISN (Siswa) atau Email (Guru BK) beserta kata sandi Anda.
          </p>
        </div>

        {/* ── Form Login ── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              NISN atau Email
            </label>
            <div className="relative">
              <Input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                type="text"
                placeholder="Contoh: 2206099 atau guru@sekolah.sch.id"
                required
                id="input-identifier"
                className="pl-9 text-xs sm:text-sm rounded-xl"
              />
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Masukkan kata sandi akun"
                required
                id="input-password"
                className="pl-9 text-xs sm:text-sm rounded-xl"
              />
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-2"
            id="btn-login"
          >
            {submitting ? "Memproses..." : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* ── Footer ── */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Belum memiliki akun siswa?{" "}
            <Link
              href="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Daftar Akun Baru
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
