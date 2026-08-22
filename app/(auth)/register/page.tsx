"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Building2, IdCard, Lock, Mail, User } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/axios";
import type { SchoolClass } from "@/types";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [nisn, setNisn] = useState("");
  const [email, setEmail] = useState("");
  const [originSchool, setOriginSchool] = useState("SMAN 18 Garut");
  const [studentClass, setStudentClass] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { registerStudent } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Load available active classes for SMAN 18 Garut from database
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await api.get("/classes/public");
        const list: SchoolClass[] = res.data.data || [];
        setAvailableClasses(list.map((c) => c.name));
      } catch {
        setAvailableClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    }
    fetchClasses();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!studentClass) {
      toast({
        title: "Validasi Gagal",
        description: "Silakan pilih kelas Anda. Jika belum ada, hubungi Guru BK.",
        type: "error",
      });
      return;
    }
    if (password !== passwordConfirmation) {
      toast({ title: "Validasi Gagal", description: "Konfirmasi password tidak cocok.", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const msg = await registerStudent({
        name,
        nisn,
        email: email || undefined,
        class: studentClass,
        origin_school: originSchool || "SMAN 18 Garut",
        password,
        password_confirmation: passwordConfirmation,
      });

      toast({
        title: "Pendaftaran Berhasil",
        description: msg || "Akun Anda berhasil dibuat. Silakan login.",
        type: "success",
      });
      router.push("/login");
    } catch (error: any) {
      toast({
        title: "Pendaftaran Gagal",
        description: error.appMessage || error.response?.data?.message || "Terjadi kesalahan saat mendaftar.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:py-12 bg-slate-50">
      <section className="nb-card relative z-10 w-full max-w-lg p-6 sm:p-8 bg-white border border-slate-200 shadow-sm rounded-2xl transition-all">
        {/* ── Brand Header (Logo -> Nama Brand -> Judul Register) ── */}
        <div className="mb-6 flex flex-col items-center text-center">
          {/* Logo container yang jelas & menonjol */}
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50/80 border border-indigo-100/80 shadow-xs p-2.5">
            <Image
              src="/image/logo.png"
              alt="Logo Find My Career"
              width={64}
              height={64}
              className="h-full w-full object-contain"
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

          {/* Judul Form */}
          <h1 className="text-base font-semibold text-slate-800">
            Pendaftaran Akun Siswa
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xs">
            Lengkapi data di bawah ini untuk membuat akun siswa baru.
          </p>
        </div>

        {/* ── Form Registrasi ── */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Nama Lengkap */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap siswa"
                required
                id="input-name"
                className="pl-9 text-xs sm:text-sm rounded-xl"
              />
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* NISN & Kelas */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                NISN <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  placeholder="Contoh: 0012345678"
                  required
                  id="input-nisn"
                  className="pl-9 text-xs sm:text-sm rounded-xl"
                />
                <IdCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Kelas <span className="text-red-500">*</span>
              </label>
              {loadingClasses ? (
                <div className="nb-input bg-slate-50 py-2 text-xs text-slate-400 rounded-xl">
                  Memuat daftar kelas...
                </div>
              ) : availableClasses.length === 0 ? (
                <div className="nb-input border-dashed border-amber-200 bg-amber-50/80 py-2 text-xs text-amber-800 rounded-xl">
                  Belum ada kelas terdaftar.
                </div>
              ) : (
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  required
                  id="select-class"
                  className="nb-input text-xs sm:text-sm w-full rounded-xl"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {availableClasses.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Asal Sekolah & Email */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Asal Sekolah <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <div className="relative">
                <Input
                  value={originSchool}
                  onChange={(e) => setOriginSchool(e.target.value)}
                  placeholder="SMAN 18 Garut"
                  id="input-origin-school"
                  className="pl-9 text-xs sm:text-sm rounded-xl"
                />
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Email <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <div className="relative">
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="email@example.com"
                  id="input-email"
                  className="pl-9 text-xs sm:text-sm rounded-xl"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Password & Konfirmasi */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Min. 6 karakter"
                  required
                  id="input-password"
                  className="pl-9 text-xs sm:text-sm rounded-xl"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  type="password"
                  placeholder="Ulangi password"
                  required
                  id="input-password-confirmation"
                  className="pl-9 text-xs sm:text-sm rounded-xl"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-2"
            id="btn-daftar-siswa"
          >
            {submitting ? "Mendaftarkan..." : (
              <>
                <span>Daftar Akun Siswa</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* ── Footer ── */}
        <div className="mt-5 border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Sudah memiliki akun siswa?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
