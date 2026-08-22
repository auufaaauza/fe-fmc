"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [originSchool, setOriginSchool] = useState("");
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
        description: error.appMessage || error.response?.data?.message || "Terjadi kesalahan.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:py-12 bg-[#FFFBF0]">
      {/* Decorative Neo-brutalism Shapes */}
      <div className="hidden sm:block absolute -left-12 top-16 h-36 w-36 rotate-12 border-4 border-black bg-yellow-400 pointer-events-none" />
      <div className="hidden sm:block absolute bottom-10 right-8 h-48 w-48 -rotate-6 border-4 border-black bg-pink-400 pointer-events-none" />

      <section className="nb-card relative z-10 w-full max-w-lg bg-white p-5 sm:p-8">
        <div className="mb-5 flex justify-center">
          <Image
            src="/image/logo.png"
            alt="Find My Career"
            width={180}
            height={50}
            className="h-11 sm:h-13 w-auto object-contain"
            priority
          />
        </div>

        <h1 className="mb-1 text-center text-lg sm:text-xl font-black uppercase tracking-wide">
          Daftar Akun Siswa
        </h1>
        <p className="mb-5 text-center text-xs text-gray-500 font-bold">
          Untuk akun Guru BK, akun dikelola langsung oleh pihak sekolah.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Nama */}
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-black">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap siswa"
              required
              id="input-name"
            />
          </div>

          {/* NISN */}
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-black">
              NISN (Nomor Induk Siswa Nasional) <span className="text-red-500">*</span>
            </label>
            <Input
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              placeholder="Contoh: 0012345678"
              required
              id="input-nisn"
            />
          </div>

          {/* Kelas (Dropdown Pilihan Murni dari Database) */}
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-black">
              Kelas <span className="text-red-500">*</span>
            </label>
            {loadingClasses ? (
              <div className="nb-input bg-gray-100 py-2 text-xs text-gray-500">
                Memuat daftar kelas...
              </div>
            ) : availableClasses.length === 0 ? (
              <div className="nb-input bg-amber-50 py-2 text-xs font-bold text-amber-900 border-2 border-dashed border-amber-400">
                Belum ada kelas yang didaftarkan. Hubungi Guru BK untuk menambahkan kelas.
              </div>
            ) : (
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                required
                id="select-class"
                className="nb-input text-xs sm:text-sm w-full font-bold"
              >
                <option value="">-- Pilih Kelas Anda --</option>
                {availableClasses.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Asal Sekolah (Ketik Manual & Opsional) */}
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-black">
              Asal Sekolah <span className="text-gray-400 font-normal">(Opsional)</span>
            </label>
            <Input
              value={originSchool}
              onChange={(e) => setOriginSchool(e.target.value)}
              placeholder="Contoh: SMAN 18 Garut"
              id="input-origin-school"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-black">
              Email <span className="text-gray-400 font-normal">(Opsional)</span>
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="email.siswa@example.com"
              id="input-email"
            />
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-black">
                Password <span className="text-red-500">*</span>
              </label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Min. 6 karakter"
                required
                id="input-password"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-black">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <Input
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                type="password"
                placeholder="Ulangi password"
                required
                id="input-password-confirmation"
              />
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="mt-4 w-full" id="btn-daftar-siswa">
            {submitting ? "Mendaftarkan..." : "Daftar Sekarang"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs sm:text-sm font-bold">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="text-pink-600 underline decoration-2 underline-offset-2 hover:text-pink-700"
          >
            Masuk di sini
          </Link>
        </p>
      </section>
    </main>
  );
}
