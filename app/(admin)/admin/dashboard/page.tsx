"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  BarChart3,
  BookOpenCheck,
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

const riasecColors: Record<string, { bar: string; bg: string; text: string }> = {
  Realistic:     { bar: "bg-blue-500",    bg: "bg-blue-50",    text: "text-blue-700" },
  Investigative: { bar: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  Artistic:      { bar: "bg-purple-500",  bg: "bg-purple-50",  text: "text-purple-700" },
  Social:        { bar: "bg-amber-500",   bg: "bg-amber-50",   text: "text-amber-700" },
  Enterprising:  { bar: "bg-orange-500",  bg: "bg-orange-50",  text: "text-orange-700" },
  Conventional:  { bar: "bg-pink-500",    bg: "bg-pink-50",    text: "text-pink-700" },
};

const metricCards = (stats: AdminStats | null) => [
  {
    label: "Total Siswa",
    value: stats?.total_students ?? 0,
    sub: "Siswa terdaftar",
    icon: Users,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-50",
  },
  {
    label: "Rapor Terisi",
    value: stats?.rapor_complete ?? 0,
    sub: stats?.total_students
      ? `${Math.round(((stats.rapor_complete ?? 0) / stats.total_students) * 100)}% Partisipasi`
      : "0%",
    icon: BookOpenCheck,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50",
  },
  {
    label: "Kuesioner Selesai",
    value: stats?.questionnaire_complete ?? 0,
    sub: stats?.total_students
      ? `${Math.round(((stats.questionnaire_complete ?? 0) / stats.total_students) * 100)}% Selesai`
      : "0%",
    icon: ClipboardList,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-50",
  },
  {
    label: "Rekomendasi Terbit",
    value: stats?.recommendation_complete ?? 0,
    sub: "Hasil tersedia",
    icon: Trophy,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
  },
];

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
        toast({ title: "Gagal memuat dashboard", description: error.appMessage || "Terjadi kesalahan.", type: "error" });
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [toast]);

  if (loading) return <LoadingSpinner />;

  const totalRiasecScore = (stats?.riasec_distribution ?? []).reduce((a, c) => a + c.total_score, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Guru BK"
        description="Pantau status dan analisis tren minat siswa di sekolah Anda."
      />

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards(stats).map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="nb-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {card.label}
                </span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              </div>
              <div className="text-3xl font-semibold text-slate-900 tabular-nums">{card.value}</div>
              <div className={`mt-1.5 text-xs ${card.iconColor}`}>{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Analytics Grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* RIASEC Distribution */}
        <div className="nb-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                <Sparkles className="h-4 w-4 text-purple-500" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">
                Distribusi Minat Siswa (RIASEC)
              </h2>
            </div>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
              Holistic
            </span>
          </div>

          <p className="mb-5 text-xs text-slate-500">
            Akumulasi skor minat karir seluruh siswa berdasarkan 6 dimensi kepribadian Holland:
          </p>

          <div className="space-y-4">
            {(stats?.riasec_distribution ?? []).map((item) => {
              const pct = totalRiasecScore > 0 ? Math.round((item.total_score / totalRiasecScore) * 100) : 0;
              const color = riasecColors[item.name] ?? { bar: "bg-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700" };
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className={`flex items-center gap-1.5 font-medium ${color.text}`}>
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md ${color.bg} text-[10px] font-bold`}>
                        {item.name.charAt(0)}
                      </span>
                      {item.name}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {item.total_score} Poin · {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color.bar} transition-all duration-700`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Programs */}
        <div className="nb-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                <GraduationCap className="h-4 w-4 text-amber-500" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">
                Top Jurusan Direkomendasikan
              </h2>
            </div>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              Top 3 SAW
            </span>
          </div>

          <p className="mb-5 text-xs text-slate-500">
            Program studi yang paling sering masuk 3 besar hasil perhitungan siswa:
          </p>

          {!stats?.top_recommended_programs || stats.top_recommended_programs.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Belum ada data rekomendasi siswa.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.top_recommended_programs.map((prog, idx) => (
                <div
                  key={prog.program_id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-semibold text-indigo-600">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {prog.program_name}
                      </p>
                      <p className="text-xs text-slate-500">{prog.faculty}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      {prog.total_recommended} Siswa
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Avg: {prog.avg_score}
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
          <h2 className="text-base font-semibold text-slate-900">
            Rekomendasi Terbaru Siswa
          </h2>
          <Link
            href="/admin/siswa"
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Lihat Semua <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="nb-card overflow-x-auto">
          <table className="nb-table w-full">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Tanggal Perhitungan</th>
                <th>Jurusan #1</th>
                <th className="text-center">Skor SAW</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recent_recommendations ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada siswa yang melakukan perhitungan rekomendasi.
                  </td>
                </tr>
              ) : (
                stats?.recent_recommendations.map((item) => {
                  const top = item.results?.[0];
                  return (
                    <tr key={item.id}>
                      <td>
                        <p className="font-medium text-slate-900">{item.user?.name}</p>
                        <p className="text-xs text-slate-400">
                          NISN: {item.user?.nisn || "-"} · {item.user?.class || "-"}
                        </p>
                      </td>
                      <td className="text-xs text-slate-500">
                        {new Date(item.calculated_at).toLocaleString("id-ID")}
                      </td>
                      <td>
                        <span className="font-medium text-slate-800">
                          {top?.program?.name ?? "-"}
                        </span>
                        {top?.program?.faculty && (
                          <span className="block text-xs text-slate-400">{top.program.faculty}</span>
                        )}
                      </td>
                      <td className="text-center font-mono text-sm font-semibold text-indigo-600">
                        {top ? Number(top.preference_value).toFixed(4) : "-"}
                      </td>
                      <td className="text-right">
                        {item.user?.id && (
                          <Link
                            href={`/admin/siswa/${item.user.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
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
