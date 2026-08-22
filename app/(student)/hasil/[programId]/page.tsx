"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Compass,
  GraduationCap,
  Sparkles,
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
      {/* Back button */}
      <div>
        <Button asChild variant="outline" className="flex items-center gap-2 text-xs sm:text-sm">
          <Link href="/hasil">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Hasil Rekomendasi
          </Link>
        </Button>
      </div>

      {/* Header Banner */}
      <header className="nb-card bg-yellow-300 p-6 sm:p-8 border-4 border-black shadow-[4px_4px_0px_0px_#000]">
        <span className="nb-badge bg-white text-xs font-black text-black mb-2 inline-block">
          {program.faculty || "Kelompok Program Studi"}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight">
          {program.name}
        </h1>
        <p className="mt-3 text-sm sm:text-base font-medium text-gray-900 leading-relaxed max-w-3xl">
          {program.description}
        </p>
      </header>

      {/* ── REKOMENDASI PERGURUAN TINGGI (PTN & PTS) ── */}
      {program.universities && program.universities.length > 0 && (
        <section className="nb-card bg-white p-5 sm:p-6 border-2 border-black">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3 mb-4">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-black uppercase text-black">
              Rujukan Perguruan Tinggi Terkemuka (PTN / PTS)
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-4">
            Berikut adalah beberapa perguruan tinggi negeri dan swasta unggulan di Indonesia yang memiliki program studi <strong>{program.name}</strong> bereputasi:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {program.universities.map((univ, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 border-2 border-black bg-yellow-50 p-3 shadow-[2px_2px_0px_0px_#000] hover:bg-yellow-100 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center border border-black bg-black text-white font-mono text-xs font-black shrink-0">
                  {idx + 1}
                </div>
                <span className="text-xs sm:text-sm font-black text-black">
                  {univ}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── JALUR BELAJAR (ROADMAP 4 TAHUN) ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 border-b-2 border-black pb-2">
          <Calendar className="h-5 w-5 text-pink-600" />
          <h2 className="text-lg sm:text-xl font-black uppercase text-black">
            Jalur Pembelajaran Kuliah (4 Tahun)
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(program.learning_path ?? {}).map(([year, text]) => (
            <div
              key={year}
              className="nb-card bg-white p-4 flex flex-col justify-between hover:bg-pink-50/40 transition-colors"
            >
              <div>
                <span className="inline-block border-2 border-black bg-pink-300 px-2.5 py-1 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] mb-2">
                  {year}
                </span>
                <p className="text-xs sm:text-sm font-bold text-gray-800 leading-relaxed">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROSPEK KARIR & PEKERJAAN ── */}
      <section className="nb-card bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3 mb-4">
          <Briefcase className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg sm:text-xl font-black uppercase text-black">
            Peluang Profesi & Prospek Karir
          </h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {(program.career_paths ?? []).map((career) => (
            <span
              key={career}
              className="border-2 border-black bg-pink-200 px-3.5 py-1.5 text-xs sm:text-sm font-black text-pink-950 shadow-[2px_2px_0px_0px_#000]"
            >
              {career}
            </span>
          ))}
        </div>
      </section>

      {/* ── KRITERIA PENDUKUNG KEPUTUSAN SAW ── */}
      <section className="nb-card bg-white p-5 sm:p-6 border-2 border-black">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3 mb-4">
          <Compass className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg sm:text-xl font-black uppercase text-black">
            Kriteria Pembobotan SPK SAW (Kepmendikdasmen No. 102/M/2025)
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="border-2 border-black bg-yellow-100 p-3 shadow-[2px_2px_0px_0px_#000]">
            <p className="text-[10px] font-black uppercase text-gray-600">
              Kriteria C1 (Mapel Utama)
            </p>
            <p className="text-sm font-black text-black mt-0.5">
              {criteria?.primary_subject?.name || "-"}
            </p>
            <span className="font-mono text-xs font-bold text-gray-700">
              Bobot: {criteria?.primary_weight} (40%)
            </span>
          </div>

          <div className="border-2 border-black bg-blue-100 p-3 shadow-[2px_2px_0px_0px_#000]">
            <p className="text-[10px] font-black uppercase text-gray-600">
              Kriteria C2 (Mapel Pendukung)
            </p>
            <p className="text-sm font-black text-black mt-0.5">
              {criteria?.secondary_subject?.name ?? "Tidak Ada"}
            </p>
            <span className="font-mono text-xs font-bold text-gray-700">
              Bobot: {criteria?.secondary_weight ?? 0} (30%)
            </span>
          </div>

          <div className="border-2 border-black bg-purple-100 p-3 shadow-[2px_2px_0px_0px_#000]">
            <p className="text-[10px] font-black uppercase text-gray-600">
              Kriteria C3 (Minat Karir RIASEC)
            </p>
            <p className="text-sm font-black text-black mt-0.5">
              {criteria?.interest_category?.name || "-"}
            </p>
            <span className="font-mono text-xs font-bold text-gray-700">
              Bobot: {criteria?.interest_weight} (30%)
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
