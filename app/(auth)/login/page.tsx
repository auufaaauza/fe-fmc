"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

const roleTabs: { value: Role; label: string }[] = [
  { value: "student", label: "Siswa" },
  { value: "admin", label: "Guru BK" },
];

export default function LoginPage() {
  const [role, setRole] = useState<Role>("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(role, identifier, password);
      toast({ title: "Login berhasil", type: "success" });
    } catch (error: any) {
      toast({ title: "Login gagal", description: error.appMessage, type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:py-12 bg-[#FFFBF0]">
      {/* Decorative Neo-brutalism Shapes */}
      <div className="hidden sm:block absolute -left-12 top-16 h-36 w-36 rotate-12 border-4 border-black bg-yellow-400 pointer-events-none" />
      <div className="hidden sm:block absolute bottom-10 right-8 h-48 w-48 -rotate-6 border-4 border-black bg-pink-400 pointer-events-none" />

      <section className="nb-card relative z-10 w-full max-w-md bg-white p-5 sm:p-8">
        <div className="mb-6 flex justify-center">
          <Image
            src="/image/logo.png"
            alt="Find My Career"
            width={180}
            height={50}
            className="h-11 sm:h-13 w-auto object-contain"
            priority
          />
        </div>

        {/* Role Tabs — only Siswa & Guru BK */}
        <div className="mb-5 grid grid-cols-2 gap-2">
          {roleTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              id={`tab-login-${tab.value}`}
              onClick={() => {
                setRole(tab.value);
                setIdentifier("");
              }}
              className={`border-2 border-black p-2.5 text-xs sm:text-sm font-black transition-colors ${
                role === tab.value
                  ? "bg-yellow-400 shadow-[2px_2px_0px_0px_#000]"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-black">
              {role === "student" ? "NISN (Nomor Induk Siswa Nasional)" : "Email Akun"}
            </label>
            <Input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              type={role === "student" ? "text" : "email"}
              placeholder={role === "student" ? "Contoh: 0012345678" : "email@sekolah.sch.id"}
              required
              id="input-identifier"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-black">Password</label>
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Masukkan password"
              required
              id="input-password"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full mt-2" id="btn-login">
            {submitting ? "Memproses..." : "Masuk ke Sistem"}
          </Button>
        </form>

        {/* Register link — hanya untuk siswa */}
        {role === "student" && (
          <p className="mt-6 text-center text-xs sm:text-sm font-bold">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-pink-600 underline decoration-2 underline-offset-2 hover:text-pink-700"
            >
              Daftar di sini
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
