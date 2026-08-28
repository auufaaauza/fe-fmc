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
  Layers,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
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
  total_classes: number;
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

// Bar chart color palette (hex for recharts)
const BAR_COLORS = [
  "#4f46e5", // indigo
  "#7c3aed", // violet
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
];

// Custom tooltip for bar chart
function ProgramTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg text-sm">
        <p className="font-semibold text-slate-900 mb-0.5">{d.program_name}</p>
        <p className="text-xs text-slate-500 mb-2">{d.faculty}</p>
        <div className="flex gap-4">
          <span className="text-indigo-600 font-medium">{d.total_recommended} Siswa</span>
          <span className="text-slate-400">Avg SAW: {d.avg_score}</span>
        </div>
      </div>
    );
  }
  return null;
}

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

  // Metric cards definition (5 cards incl. Total Kelas)
  const metricCards = [
    {
      label: "Total Siswa",
      value: stats?.total_students ?? 0,
      sub: "Siswa terdaftar",
      icon: Users,
      iconColor: "text-indigo-500",
      iconBg: "bg-indigo-50",
      href: "/admin/siswa",
    },
    {
      label: "Total Kelas",
      value: stats?.total_classes ?? 0,
      sub: "Kelas aktif",
      icon: Layers,
      iconColor: "text-violet-500",
      iconBg: "bg-violet-50",
      href: "/admin/kelas",
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
      href: null,
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
      href: null,
    },
    {
      label: "Rekomendasi Terbit",
      value: stats?.recommendation_complete ?? 0,
      sub: "Hasil tersedia",
      icon: Trophy,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50",
      href: null,
    },
  ];

  // Bar chart data: shorten label for display
  const barChartData = (stats?.top_recommended_programs ?? []).map((p) => ({
    ...p,
    short_name: p.program_name.length > 22 ? p.program_name.slice(0, 20) + "…" : p.program_name,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Guru BK"
        description="Pantau status dan analisis tren minat siswa di sekolah Anda."
      />

      {/* ── Metric Cards (5 cards) ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const inner = (
            <div className="nb-card p-5 hover:shadow-md transition-shadow h-full">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {card.label}
                </span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              </div>
              <div className="text-3xl font-semibold text-slate-900 tabular-nums">{card.value}</div>
              <div className={`mt-1.5 text-xs ${card.iconColor} flex items-center gap-1`}>
                {card.sub}
                {card.href && (
                  <ChevronRight className="h-3 w-3 opacity-60" />
                )}
              </div>
            </div>
          );

          return card.href ? (
            <Link key={card.label} href={card.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={card.label}>{inner}</div>
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

        {/* Top Programs — Bar Chart */}
        <div className="nb-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                <BarChart3 className="h-4 w-4 text-amber-500" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">
                Top Jurusan Direkomendasikan
              </h2>
            </div>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              Top 5 SAW
            </span>
          </div>

          <p className="mb-4 text-xs text-slate-500">
            Program studi paling sering masuk 3 besar hasil perhitungan SAW siswa:
          </p>

          {!stats?.top_recommended_programs || stats.top_recommended_programs.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-slate-400">
              Belum ada data rekomendasi siswa.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={barChartData}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                barSize={28}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="short_name"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  label={{ value: "Siswa", angle: -90, position: "insideLeft", offset: 20, fontSize: 10, fill: "#94a3b8" }}
                />
                <Tooltip content={<ProgramTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="total_recommended" radius={[6, 6, 0, 0]}>
                  {barChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Legend */}
          {barChartData.length > 0 && (
            <div className="mt-3 space-y-1">
              {barChartData.map((prog, idx) => (
                <div key={prog.program_id} className="flex items-center gap-2 text-xs text-slate-600">
                  <span
                    className="h-2.5 w-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: BAR_COLORS[idx % BAR_COLORS.length] }}
                  />
                  <span className="truncate font-medium">{prog.program_name}</span>
                  <span className="ml-auto shrink-0 text-slate-400">{prog.total_recommended} siswa</span>
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
