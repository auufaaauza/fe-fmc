"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Eye,
  GraduationCap,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { api } from "@/lib/axios";
import type { Recommendation } from "@/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/toast";

interface RiasecItem {
  id: number;
  name: string;
  icon?: string;
  total_score: number;
}

interface TopProgramItem {
  program_id: number;
  program_name: string;
  faculty: string;
  total_recommended: number;
  avg_score: number;
}

interface AdminStats {
  total_students: number;
  rapor_complete: number;
  questionnaire_complete: number;
  recommendation_complete: number;
  recent_recommendations: Recommendation[];
  riasec_distribution?: RiasecItem[];
  top_recommended_programs?: TopProgramItem[];
}

const riasecColors: Record<string, { bg: string; bar: string; text: string }> = {
  Realistic: { bg: "bg-blue-100", bar: "bg-blue-500", text: "text-blue-900" },
  Investigative: { bg: "bg-emerald-100", bar: "bg-emerald-500", text: "text-emerald-900" },
  Artistic: { bg: "bg-purple-100", bar: "bg-purple-500", text: "text-purple-900" },
  Social: { bg: "bg-yellow-100", bar: "bg-yellow-500", text: "text-yellow-900" },
  Enterprising: { bg: "bg-orange-100", bar: "bg-orange-500", text: "text-orange-900" },
  Conventional: { bg: "bg-pink-100", bar: "bg-pink-500", text: "text-pink-900" },
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await api.get("/admin/stats");
        setStats(response.data.data);
      } catch (error: any) {
        toast({
          title: "Gagal memuat dashboard",
          description: error.appMessage || "Terjadi kesalahan.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [toast]);

  if (loading) return <LoadingSpinner />;

  // Calculate total RIASEC score for percentage calculation
  const totalRiasecScore = (stats?.riasec_distribution ?? []).reduce(
    (acc, curr) => acc + curr.total_score,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Dashboard Guru BK"
        description="Analisis tren minat siswa dan pantauan status rekomendasi karir di sekolah Anda."
      />

      {/* ── 4 Metric Summary Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Siswa */}
        <div className="nb-card bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-gray-500">
              Total Siswa Terdaftar
            </span>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-black">
            {stats?.total_students ?? 0}
          </div>
          <div className="mt-2 text-xs font-bold text-gray-600">
            Siswa sekolah ini
          </div>
        </div>

        {/* Card 2: Rapor Lengkap */}
        <div className="nb-card bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-gray-500">
              Rapor Terisi
            </span>
            <BookOpenCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-black">
            {stats?.rapor_complete ?? 0}
          </div>
          <div className="mt-2 text-xs font-bold text-emerald-700">
            {stats?.total_students
              ? `${Math.round(((stats.rapor_complete ?? 0) / stats.total_students) * 100)}% Partisipasi`
              : "0%"}
          </div>
        </div>

        {/* Card 3: Kuesioner Selesai */}
        <div className="nb-card bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-gray-500">
              Kuesioner Selesai
            </span>
            <ClipboardList className="h-5 w-5 text-pink-600" />
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-black">
            {stats?.questionnaire_complete ?? 0}
          </div>
          <div className="mt-2 text-xs font-bold text-pink-700">
            {stats?.total_students
              ? `${Math.round(((stats.questionnaire_complete ?? 0) / stats.total_students) * 100)}% Selesai`
              : "0%"}
          </div>
        </div>

        {/* Card 4: Rekomendasi Terhitung */}
        <div className="nb-card bg-yellow-300 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-gray-900">
              Rekomendasi Terbit
            </span>
            <Trophy className="h-5 w-5 text-black" />
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-black">
            {stats?.recommendation_complete ?? 0}
          </div>
          <div className="mt-2 text-xs font-black text-gray-900">
            Hasil Rekomendasi tersedia
          </div>
        </div>
      </div>

      {/* ── 2 Analytics Grid: RIASEC & Top Recommended Programs ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. Visualisasi Distribusi Minat RIASEC */}
        <div className="nb-card bg-white p-6">
          <div className="mb-4 flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-600" />
              <h2 className="text-lg font-black uppercase text-black">
                Distribusi Minat Siswa (RIASEC)
              </h2>
            </div>
            <span className="nb-badge bg-purple-200 text-xs">Holistic Profile</span>
          </div>

          <p className="mb-4 text-xs font-medium text-gray-600">
            Akumulasi skor preferensi minat karir seluruh siswa berdasarkan 6 dimensi kepribadian John Holland:
          </p>

          <div className="space-y-3.5">
            {(stats?.riasec_distribution ?? []).map((item) => {
              const percentage =
                totalRiasecScore > 0
                  ? Math.round((item.total_score / totalRiasecScore) * 100)
                  : 0;
              const color = riasecColors[item.name] || {
                bg: "bg-gray-100",
                bar: "bg-yellow-400",
                text: "text-gray-900",
              };

              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-black text-[9px] font-black text-white">
                        {item.name.charAt(0)}
                      </span>
                      <span>{item.name}</span>
                    </span>
                    <span className="font-mono text-gray-700">
                      {item.total_score} Poin ({percentage}%)
                    </span>
                  </div>
                  {/* Progress bar visual */}
                  <div className="h-3 w-full border-2 border-black bg-gray-100">
                    <div
                      className={`h-full ${color.bar} transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Top 5 Program Studi Paling Direkomendasikan */}
        <div className="nb-card bg-white p-6">
          <div className="mb-4 flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-yellow-600" />
              <h2 className="text-lg font-black uppercase text-black">
                Top Jurusan Paling Direkomendasikan
              </h2>
            </div>
            <span className="nb-badge bg-yellow-300 text-xs">Top 3 SAW</span>
          </div>

          <p className="mb-4 text-xs font-medium text-gray-600">
            Program studi yang paling sering menempati urutan 3 besar pada hasil perhitungan siswa:
          </p>

          {!stats?.top_recommended_programs || stats.top_recommended_programs.length === 0 ? (
            <div className="py-8 text-center text-sm font-bold text-gray-500">
              Belum ada data rekomendasi siswa yang dihitung.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.top_recommended_programs.map((prog, idx) => (
                <div
                  key={prog.program_id}
                  className="flex items-center justify-between border-2 border-black bg-yellow-50/60 p-3 shadow-[2px_2px_0px_0px_#000]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-yellow-400 font-black text-sm">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-black">
                        {prog.program_name}
                      </p>
                      <p className="text-[11px] font-bold text-gray-600">
                        {prog.faculty}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="nb-badge bg-pink-300 text-[10px]">
                      {prog.total_recommended} Siswa
                    </span>
                    <p className="font-mono text-[10px] font-bold text-gray-600 mt-0.5">
                      Avg Score: {prog.avg_score}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Recommendations Table ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tight">
            Rekomendasi Terbaru Siswa
          </h2>
          <Link
            href="/admin/siswa"
            className="flex items-center gap-1 text-xs font-black uppercase text-pink-600 hover:underline"
          >
            Lihat Semua Siswa <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="nb-card overflow-x-auto">
          <table className="nb-table w-full border-collapse bg-white">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Tanggal Perhitungan</th>
                <th>Jurusan Rekomendasi #1</th>
                <th className="text-center">Skor SAW</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recent_recommendations ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm font-bold text-gray-500">
                    Belum ada siswa yang melakukan perhitungan rekomendasi.
                  </td>
                </tr>
              ) : (
                stats?.recent_recommendations.map((item) => {
                  const top = item.results?.[0];
                  return (
                    <tr key={item.id}>
                      <td>
                        <p className="font-black text-black">{item.user?.name}</p>
                        <p className="text-xs text-gray-500">
                          NISN: {item.user?.nisn || "-"} • {item.user?.class || "-"}
                        </p>
                      </td>
                      <td className="text-xs font-bold text-gray-700">
                        {new Date(item.calculated_at).toLocaleString("id-ID")}
                      </td>
                      <td>
                        <span className="font-black text-black">
                          {top?.program?.name ?? "-"}
                        </span>
                        {top?.program?.faculty && (
                          <span className="block text-xs text-gray-500">
                            {top.program.faculty}
                          </span>
                        )}
                      </td>
                      <td className="text-center font-mono font-black text-pink-700">
                        {top ? Number(top.preference_value).toFixed(4) : "-"}
                      </td>
                      <td className="text-right">
                        {item.user?.id && (
                          <Link
                            href={`/admin/siswa/${item.user.id}`}
                            className="nb-btn-primary inline-flex items-center gap-1 px-2.5 py-1 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5" /> Detail
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
