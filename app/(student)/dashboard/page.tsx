"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function StudentDashboardPage() {
  const { user, progress } = useAuth();

  const steps = [
    {
      title: "1. Isi Nilai Rapor",
      description: "Masukkan nilai rata-rata rapor semester terakhir.",
      done: progress?.rapor_complete,
      href: "/rapor",
      statusText: progress?.rapor_complete ? "Selesai diisi" : "Belum diisi",
    },
    {
      title: "2. Isi Kuesioner Minat",
      description: "Jawab kuesioner eksplorasi minat karir RIASEC.",
      done: progress?.questionnaire_complete,
      href: "/questionnaire",
      statusText: progress?.questionnaire_complete ? "Selesai diisi" : "Belum diisi",
    },
    {
      title: "3. Hasil Rekomendasi",
      description: "Lihat hasil analisis jurusan kuliah & karir masa depan.",
      done: progress?.recommendation_complete,
      href: "/hasil",
      statusText: progress?.recommendation_complete ? "Tersedia" : "Menunggu langkah 1 & 2",
    },
  ];

  const ready = Boolean(progress?.rapor_complete && progress?.questionnaire_complete);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <section className="nb-card bg-yellow-300 p-6 sm:p-8">
        <div className="inline-block nb-badge mb-2 bg-pink-400 text-white">
          Portal Siswa
        </div>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-black">
          Halo, {user?.name}!
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm sm:text-base font-bold text-gray-900">
          <span>Kelas: <strong className="font-black">{user?.class ?? "-"}</strong></span>
          {user?.school && (
            <span className="flex items-center gap-1">
              • <School className="h-4 w-4 text-pink-600" /> {user.school.name}
            </span>
          )}
        </div>
      </section>

      {/* Progress Steps */}
      <div>
        <h2 className="mb-4 text-lg font-black uppercase tracking-wide">
          Tahapan Rekomendasi Karir Anda
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.href}
              className={`nb-card flex flex-col justify-between p-5 ${
                step.done ? "bg-green-50" : "bg-white"
              }`}
            >
              <div>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-lg font-black text-black">{step.title}</h3>
                  {step.done ? (
                    <CheckCircle2 className="h-7 w-7 shrink-0 text-green-600" />
                  ) : (
                    <Circle className="h-7 w-7 shrink-0 text-gray-400" />
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-700">
                  {step.description}
                </p>
                <div className="mt-3">
                  <span
                    className={`nb-badge text-[11px] ${
                      step.done ? "bg-green-300" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {step.statusText}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button asChild className="w-full">
                  <Link href={step.href}>Buka Halaman</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Quick Action when ready */}
      {ready && (
        <div className="nb-card bg-purple-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-black uppercase text-purple-950">
              Data Lengkap! Siap Melihat Hasil?
            </h3>
            <p className="text-xs sm:text-sm text-purple-900 font-medium">
              Sistem telah siap menghitung rekomendasi program studi terbaik berdasarkan nilai rapor dan kuesioner Anda.
            </p>
          </div>
          <Button asChild className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
            <Link href="/hasil">
              Lihat Rekomendasi <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
