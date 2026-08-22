"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Compass,
} from "lucide-react";
import { api } from "@/lib/axios";
import type { StudyProgram } from "@/types";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/toast";

export default function ProgramDetailPage() {
  const params = useParams<{ programId: string }>();
  const [program, setProgram] = useState<StudyProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadProgram() {
      try {
        const response = await api.get(`/study-programs/${params.programId}`);
        setProgram(response.data.data);
      } catch (error: any) {
        toast({
          title: "Gagal memuat program studi",
          description: error.appMessage || "Terjadi kesalahan.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    loadProgram();
  }, [params.programId, toast]);

  if (loading) return <LoadingSpinner />;
  if (!program) return null;

  const criteria = program.criteria;

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="flex items-center gap-2 text-xs sm:text-sm">
        <Link href="/hasil">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Hasil Rekomendasi
        </Link>
      </Button>

      <header className="nb-card p-6 sm:p-8">
        <span className="nb-badge-pink mb-3 inline-flex">
          {program.faculty || "Kelompok Program Studi"}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {program.name}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {program.description}
        </p>
      </header>

      {program.universities && program.universities.length > 0 && (
        <section className="nb-card p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-200/70 pb-3">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              Rujukan Perguruan Tinggi Terkemuka
            </h2>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-slate-600">
            Beberapa PTN dan PTS unggulan di Indonesia yang memiliki program studi{" "}
            <strong>{program.name}</strong> bereputasi.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {program.universities.map((univ, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 rounded-lg border border-white/70 bg-white/55 p-3 transition-colors hover:bg-white/80"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-mono text-xs font-semibold text-indigo-700">
                  {idx + 1}
                </div>
                <span className="text-sm font-medium text-slate-800">{univ}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Jalur Pembelajaran Kuliah (4 Tahun)
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Object.entries(program.learning_path ?? {}).map(([year, text]) => (
            <div key={year} className="nb-card p-4">
              <span className="nb-badge-pink mb-2 inline-flex">{year}</span>
              <p className="text-sm font-medium leading-relaxed text-slate-700">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="nb-card p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-200/70 pb-3">
          <Briefcase className="h-5 w-5 text-emerald-600" />
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Peluang Profesi & Prospek Karir
          </h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {(program.career_paths ?? []).map((career) => (
            <span key={career} className="nb-badge bg-white/65 px-3.5 py-1.5 text-sm">
              {career}
            </span>
          ))}
        </div>
      </section>

      <section className="nb-card p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-200/70 pb-3">
          <Compass className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Kriteria Pembobotan SPK SAW
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "C1: Mapel Utama",
              value: criteria?.primary_subject?.name || "-",
              weight: criteria?.primary_weight,
              accent: "text-amber-700 bg-amber-50/80",
            },
            {
              label: "C2: Mapel Pendukung",
              value: criteria?.secondary_subject?.name ?? "Tidak Ada",
              weight: criteria?.secondary_weight ?? 0,
              accent: "text-blue-700 bg-blue-50/80",
            },
            {
              label: "C3: Minat Karir RIASEC",
              value: criteria?.interest_category?.name || "-",
              weight: criteria?.interest_weight,
              accent: "text-indigo-700 bg-indigo-50/80",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-white/70 bg-white/55 p-3">
              <p className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${item.accent}`}>
                {item.label}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
              <span className="font-mono text-xs text-slate-500">Bobot: {item.weight}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
