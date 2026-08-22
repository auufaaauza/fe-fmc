"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Clock, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function StudentDashboardPage() {
  const { user, progress } = useAuth();

  const steps = [
    {
      title: "Isi Nilai Rapor",
      description: "Masukkan nilai rata-rata rapor semester terakhir per mata pelajaran.",
      done: progress?.rapor_complete,
      href: "/rapor",
      statusText: progress?.rapor_complete ? "Selesai diisi" : "Belum diisi",
      step: 1,
    },
    {
      title: "Isi Kuesioner Minat",
      description: "Jawab kuesioner eksplorasi minat karir RIASEC untuk mengenali kepribadianmu.",
      done: progress?.questionnaire_complete,
      href: "/questionnaire",
      statusText: progress?.questionnaire_complete ? "Selesai diisi" : "Belum diisi",
      step: 2,
    },
    {
      title: "Lihat Hasil Rekomendasi",
      description: "Lihat hasil analisis program studi & karir masa depan yang sesuai untukmu.",
      done: progress?.recommendation_complete,
      href: "/hasil",
      statusText: progress?.recommendation_complete
        ? "Hasil tersedia"
        : "Menunggu langkah 1 & 2",
      step: 3,
    },
  ];

  const ready = Boolean(progress?.rapor_complete && progress?.questionnaire_complete);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 p-6 sm:p-8 text-white shadow-lg">
        <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white/90 mb-3">
          Portal Siswa
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">
          Halo, {user?.name}!
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-indigo-100">
          <span>
            Kelas: <strong className="text-white">{user?.class ?? "-"}</strong>
          </span>
          {user?.school && (
            <span className="flex items-center gap-1">
              <School className="h-3.5 w-3.5" /> {user.school.name}
            </span>
          )}
        </div>
        {ready && (
          <p className="mt-3 text-sm text-indigo-100">
            Data Anda sudah lengkap. Lihat hasil rekomendasi di bawah.
          </p>
        )}
      </section>

      {/* Progress Steps */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-700 uppercase tracking-wider">
          Tahapan Rekomendasi Karir
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.href}
              className={`nb-card flex flex-col justify-between p-5 transition-shadow hover:shadow-md ${
                step.done
                  ? "border-green-200 bg-green-50/50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600 shrink-0">
                      {step.step}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                  </div>
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      step.done
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {step.statusText}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <Button asChild variant={step.done ? "glass" : "primary"} className="w-full">
                  <Link href={step.href}>Buka Halaman</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Quick Action CTA when ready */}
      {ready && (
        <div className="nb-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
              <ArrowRight className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Data Lengkap! Siap Melihat Hasil?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sistem siap menghitung rekomendasi program studi terbaik berdasarkan data Anda.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
            <Link href="/hasil">
              Lihat Rekomendasi <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* Pending Validation Info */}
      {ready && !progress?.recommendation_complete && (
        <div className="nb-card p-5 flex items-start gap-3 bg-amber-50 border-amber-200">
          <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Menunggu Validasi Guru BK
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Setelah hasil rekomendasi dihitung, Guru BK perlu memberikan catatan dan validasi sebelum hasil dapat Anda lihat sepenuhnya.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
