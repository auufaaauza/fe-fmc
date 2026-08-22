"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Clock,
  Filter,
  GraduationCap,
  MessageSquareQuote,
  Microscope,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
} from "lucide-react";
import { api } from "@/lib/axios";
import type { Recommendation, RecommendationResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { RankCard } from "@/components/recommendation/RankCard";
import { PrintableReport } from "@/components/recommendation/PrintableReport";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";

type RumpunFilter = "all" | "saintek" | "soshum";

const saintekKeywords = [
  "Teknik", "Kedokteran", "Farmasi", "Keperawatan", "Kesehatan",
  "Matematika", "Pengetahuan Alam", "Komputer", "Pertanian", "Peternakan",
  "Perikanan", "Kelautan", "Kehutanan", "Bioteknologi", "Biologi", "Teknologi",
];

function isSaintek(faculty?: string | null): boolean {
  if (!faculty) return true;
  return saintekKeywords.some((k) => faculty.toLowerCase().includes(k.toLowerCase()));
}

export default function HasilPage() {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [rumpun, setRumpun] = useState<RumpunFilter>("all");
  const [search, setSearch] = useState("");

  const { user, progress, refreshMe } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (progress && (!progress.rapor_complete || !progress.questionnaire_complete)) {
      router.push("/dashboard");
      toast({
        title: "Data belum lengkap",
        description: "Lengkapi nilai rapor dan kuesioner terlebih dahulu.",
        type: "error",
      });
    }
  }, [progress, router, toast]);

  useEffect(() => {
    async function loadLatest() {
      try {
        const response = await api.get("/my-recommendations/latest");
        setRecommendation(response.data.data);
      } catch (error: any) {
        toast({ title: "Gagal memuat hasil", description: error.appMessage, type: "error" });
      } finally {
        setLoading(false);
      }
    }
    loadLatest();
  }, [toast]);

  async function calculate() {
    setCalculating(true);
    try {
      const response = await api.post("/recommend");
      setRecommendation(response.data.data);
      await refreshMe();
      toast({
        title: "Berhasil Dihitung",
        description: "Rekomendasi karir berhasil dihitung. Menunggu validasi Guru BK.",
        type: "success",
      });
    } catch (error: any) {
      toast({ title: "Gagal menghitung", description: error.appMessage || "Terjadi kesalahan.", type: "error" });
    } finally {
      setCalculating(false);
    }
  }

  const filteredResults = useMemo(() => {
    if (!recommendation?.results) return [];
    return recommendation.results.filter((res) => {
      const matchesSearch = `${res.program.name} ${res.program.faculty ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (rumpun === "saintek") return isSaintek(res.program.faculty);
      if (rumpun === "soshum") return !isSaintek(res.program.faculty);
      return true;
    });
  }, [recommendation, rumpun, search]);

  if (loading) return <LoadingSpinner />;

  const isValidated = Boolean(
    recommendation?.is_validated ||
    (recommendation?.counselor_reviewed_at && recommendation?.counselor_notes)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 print:hidden">
        <div>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 mb-1.5">
            Metode Simple Additive Weighting (SAW)
          </span>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Hasil Rekomendasi Program Studi
          </h1>
        </div>

        {isValidated && recommendation && (
          <div className="flex flex-wrap items-center gap-2">
            <PrintableReport student={user} recommendation={recommendation} />
            <Button
              variant="glass"
              onClick={calculate}
              disabled={calculating}
              className="flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              {calculating ? "Menghitung..." : "Hitung Ulang"}
            </Button>
          </div>
        )}
      </div>

      {/* ── STATE 1: Belum ada rekomendasi — tombol hitung ── */}
      {!recommendation && (
        <div className="nb-card p-8 sm:p-12 text-center bg-white border border-slate-200 shadow-sm rounded-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
            <Trophy className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Data Anda Sudah Lengkap</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Nilai rapor dan kuesioner minat Anda sudah tersimpan. Klik tombol di bawah untuk menjalankan algoritma SAW dan mendapatkan rekomendasi program studi terbaik.
          </p>
          <Button
            onClick={calculate}
            disabled={calculating}
            className="mt-6 px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm"
          >
            {calculating ? "Sedang Menganalisis SAW..." : "Hitung Rekomendasi Sekarang"}
          </Button>
        </div>
      )}

      {/* ── STATE 2: Sudah dihitung, BELUM divalidasi admin ── */}
      {recommendation && !isValidated && (
        <div className="space-y-4">
          <div className="nb-card p-7 sm:p-10 text-center border-amber-200 bg-amber-50/40 rounded-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100/70">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
              Menunggu Validasi & Catatan Guru BK
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Kalkulasi rekomendasi Anda telah selesai dihitung pada{" "}
              <strong>
                {new Date(recommendation.calculated_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
              . Hasil rekomendasi dan cetak laporan PDF akan otomatis terbuka setelah Guru BK memvalidasi dan memberikan catatan arahan untuk Anda.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Nilai Rapor Terisi
              </div>
              <div className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Kuesioner Minat Selesai
              </div>
              <div className="flex items-center gap-1.5 font-medium text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                Review & Validasi Guru BK
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400">
            Dihitung pada {new Date(recommendation.calculated_at).toLocaleString("id-ID")} •
            Silakan hubungi Guru BK atau refresh halaman ini secara berkala.
          </p>
        </div>
      )}

      {/* ── STATE 3: Sudah divalidasi — tampilkan hasil lengkap ── */}
      {isValidated && recommendation && (
        <div className="space-y-6 print:hidden">
          {/* ── 1. CATATAN & ARAHAN GURU BK (PALING ATAS) ── */}
          <div className="nb-card p-5 sm:p-6 border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-indigo-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                  <MessageSquareQuote className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Catatan & Arahan Rekomendasi Guru BK
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Evaluasi resmi dan bimbingan pemilihan perguruan tinggi
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Tervalidasi
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-indigo-100/80 shadow-xs">
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                {recommendation.counselor_notes
                  ? `"${recommendation.counselor_notes}"`
                  : "Siswa disarankan berdiskusi langsung dengan Guru BK untuk penentuan strategi pilihan prodi SNBP/SNBT."}
              </p>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                Guru BK: <strong className="text-slate-700">{recommendation.counselor?.name || "Guru Bimbingan Konseling"}</strong>
              </span>
              {recommendation.counselor_reviewed_at && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="h-3 w-3" />
                  Divalidasi pada: {new Date(recommendation.counselor_reviewed_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>

          {/* ── 2. Top 1 Recommendation Banner ── */}
          {recommendation.results?.[0] && (
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 sm:p-7 text-white shadow-md">
              <div className="flex items-center justify-between text-xs font-medium text-indigo-100 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs text-white">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Rekomendasi Utama (#1)
                </span>
                <span className="font-mono text-xs bg-white/15 px-2.5 py-0.5 rounded-full text-white">
                  Skor SAW: {Number(recommendation.results[0].preference_value).toFixed(4)}
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-semibold text-white mt-2">
                {recommendation.results[0].program.name}
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1.5">
                Fakultas / Rumpun: <strong className="text-white">{recommendation.results[0].program.faculty || "-"}</strong>
              </p>
            </div>
          )}

          {/* ── 3. Filter Rumpun & Search Bar ── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
            {/* Rumpun Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { key: "all", label: `Semua Jurusan (${recommendation.results?.length ?? 0})`, icon: Filter },
                { key: "saintek", label: "Saintek", icon: Microscope },
                { key: "soshum", label: "Soshum", icon: BookOpen },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRumpun(key as RumpunFilter)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all shrink-0 ${
                    rumpun === key
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative sm:w-72">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari jurusan / fakultas..."
                className="pl-9 text-xs sm:text-sm rounded-xl"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* ── 4. Rank Cards List ── */}
          <div className="space-y-4">
            {filteredResults.length === 0 ? (
              <div className="nb-card p-8 text-center bg-white border border-slate-200 shadow-sm rounded-xl">
                <GraduationCap className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">
                  Tidak ada program studi yang cocok dengan kriteria pencarian.
                </p>
              </div>
            ) : (
              filteredResults.map((result) => (
                <RankCard key={result.id} result={result} />
              ))
            )}
          </div>

          {/* Printable Report Component (Only rendered when validated) */}
          <PrintableReport student={user} recommendation={recommendation} />
        </div>
      )}
    </div>
  );
}
