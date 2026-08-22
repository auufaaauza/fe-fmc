"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Filter,
  GraduationCap,
  MessageSquareQuote,
  Microscope,
  RotateCcw,
  Search,
  Sparkles,
  Trophy,
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
  "Teknik",
  "Kedokteran",
  "Farmasi",
  "Keperawatan",
  "Kesehatan",
  "Matematika",
  "Pengetahuan Alam",
  "Komputer",
  "Pertanian",
  "Peternakan",
  "Perikanan",
  "Kelautan",
  "Kehutanan",
  "Bioteknologi",
  "Biologi",
  "Teknologi",
];

function isSaintek(faculty?: string | null): boolean {
  if (!faculty) return true;
  return saintekKeywords.some((keyword) =>
    faculty.toLowerCase().includes(keyword.toLowerCase())
  );
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
        toast({
          title: "Gagal memuat hasil",
          description: error.appMessage,
          type: "error",
        });
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
        title: "Berhasil",
        description: "Rekomendasi karir berhasil dihitung.",
        type: "success",
      });
    } catch (error: any) {
      toast({
        title: "Gagal menghitung",
        description: error.appMessage || "Terjadi kesalahan.",
        type: "error",
      });
    } finally {
      setCalculating(false);
    }
  }

  // Filter results based on Rumpun (Saintek/Soshum) and Search query
  const filteredResults = useMemo(() => {
    if (!recommendation?.results) return [];

    return recommendation.results.filter((res) => {
      const matchesSearch = `${res.program.name} ${res.program.faculty ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (rumpun === "saintek") {
        return isSaintek(res.program.faculty);
      }
      if (rumpun === "soshum") {
        return !isSaintek(res.program.faculty);
      }
      return true;
    });
  }, [recommendation, rumpun, search]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b-4 border-black pb-4 print:hidden">
        <div>
          <div className="inline-block nb-badge mb-1 bg-yellow-300">
            Hasil Analisis Keputusan SAW
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-black">
            Rekomendasi Program Studi Anda
          </h1>
        </div>

        {recommendation && (
          <div className="flex flex-wrap items-center gap-2">
            <PrintableReport student={user} recommendation={recommendation} />
            <Button
              variant="outline"
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

      {/* When no recommendation exists yet */}
      {!recommendation ? (
        <div className="nb-card p-8 sm:p-12 text-center bg-white">
          <Trophy className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
          <h2 className="text-2xl font-black text-black">
            Data Anda Sudah Lengkap
          </h2>
          <p className="mt-2 text-sm text-gray-700 max-w-md mx-auto">
            Klik tombol di bawah untuk menjalankan algoritma SAW dan melihat urutan program studi rekomendasi terbaik bagi Anda.
          </p>
          <Button
            onClick={calculate}
            disabled={calculating}
            className="mt-6 text-base px-8 py-3"
          >
            {calculating ? "Sedang Menganalisis..." : "Hitung Rekomendasi Sekarang"}
          </Button>
        </div>
      ) : (
        <div className="space-y-6 print:hidden">
          {/* Top Recommendation Highlight Banner */}
          {recommendation.results?.[0] && (
            <div className="nb-card bg-yellow-300 p-5 sm:p-6 border-4 border-black shadow-[4px_4px_0px_0px_#000]">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-pink-700">
                <Sparkles className="h-4 w-4" /> Rekomendasi Utama Peringkat #1
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-black mt-1">
                {recommendation.results[0].program.name}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-gray-800 mt-1">
                Fakultas: {recommendation.results[0].program.faculty || "-"} • Skor Preferensi SAW:{" "}
                <span className="font-mono font-black text-pink-900">
                  {Number(recommendation.results[0].preference_value).toFixed(4)}
                </span>
              </p>
            </div>
          )}

          {/* ── CATATAN & ARAHAN DARI GURU BK (JIKA ADA) ── */}
          {recommendation.counselor_notes && (
            <div className="nb-card bg-blue-50 p-5 sm:p-6 border-4 border-black shadow-[4px_4px_0px_0px_#000]">
              <div className="flex items-center justify-between border-b-2 border-black pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquareQuote className="h-5 w-5 text-blue-700" />
                  <h3 className="text-sm sm:text-base font-black uppercase text-blue-950">
                    Catatan & Arahan Guru BK
                  </h3>
                </div>
                <span className="nb-badge bg-blue-200 text-[11px] text-blue-900">
                  Bimbingan Konseling
                </span>
              </div>

              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-relaxed whitespace-pre-line">
                "{recommendation.counselor_notes}"
              </p>

              <div className="mt-3 flex items-center justify-between border-t border-blue-200 pt-2 text-[11px] font-bold text-blue-800">
                <span>
                  Oleh: <strong>{recommendation.counselor?.name || "Guru BK SMAN 18 Garut"}</strong>
                </span>
                {recommendation.counselor_reviewed_at && (
                  <span>
                    {new Date(recommendation.counselor_reviewed_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Rumpun Filter Tabs & Search Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter Tabs */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setRumpun("all")}
                className={`border-2 border-black px-3.5 py-2 text-xs sm:text-sm font-black transition-colors shrink-0 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                  rumpun === "all" ? "bg-yellow-400" : "bg-white hover:bg-gray-100"
                }`}
              >
                Semua Jurusan ({recommendation.results.length})
              </button>
              <button
                type="button"
                onClick={() => setRumpun("saintek")}
                className={`flex items-center gap-1.5 border-2 border-black px-3.5 py-2 text-xs sm:text-sm font-black transition-colors shrink-0 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                  rumpun === "saintek" ? "bg-blue-300" : "bg-white hover:bg-gray-100"
                }`}
              >
                <Microscope className="h-4 w-4 shrink-0" />
                <span>Sains & Teknologi (Saintek)</span>
              </button>
              <button
                type="button"
                onClick={() => setRumpun("soshum")}
                className={`flex items-center gap-1.5 border-2 border-black px-3.5 py-2 text-xs sm:text-sm font-black transition-colors shrink-0 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                  rumpun === "soshum" ? "bg-orange-300" : "bg-white hover:bg-gray-100"
                }`}
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <span>Sosial & Humaniora (Soshum)</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative sm:w-72">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama jurusan / fakultas..."
                className="pl-9 text-xs sm:text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* List of Rank Cards */}
          <div className="space-y-4">
            {filteredResults.length === 0 ? (
              <div className="nb-card p-8 text-center bg-white">
                <p className="font-black text-gray-600">
                  Tidak ada program studi yang cocok dengan kriteria pencarian atau rumpun yang dipilih.
                </p>
              </div>
            ) : (
              filteredResults.map((result) => (
                <RankCard key={result.id} result={result} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Hidden printable letterhead for printing */}
      <PrintableReport student={user} recommendation={recommendation} />
    </div>
  );
}
