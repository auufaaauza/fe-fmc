"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  MessageSquareQuote,
  MoveHorizontal,
  Save,
  School,
  Trophy,
  User,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/axios";
import type { QuestionnaireAnswer, Recommendation, StudentScore, User as UserType } from "@/types";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { RankCard } from "@/components/recommendation/RankCard";
import { PrintableReport } from "@/components/recommendation/PrintableReport";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function AdminStudentDetailPage() {
  const params = useParams<{ id: string }>();
  const [student, setStudent] = useState<UserType | null>(null);
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"rekomendasi" | "rapor" | "kuesioner">("rekomendasi");

  // Counselor Notes state
  const [counselorNotes, setCounselorNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    async function loadDetail() {
      try {
        const response = await api.get(`/admin/students/${params.id}/recommendation`);
        setStudent(response.data.student);
        setScores(response.data.scores || []);
        setAnswers(response.data.answers || []);
        const rec = response.data.data;
        setRecommendation(rec);
        if (rec?.counselor_notes) {
          setCounselorNotes(rec.counselor_notes);
        }
      } catch (error: any) {
        toast({
          title: "Gagal memuat detail siswa",
          description: error.appMessage || "Terjadi kesalahan.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [params.id, toast]);

  async function handleSaveCounselorNote(e: FormEvent) {
    e.preventDefault();
    if (!counselorNotes.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Catatan bimbingan konseling tidak boleh kosong.",
        type: "error",
      });
      return;
    }

    setSavingNotes(true);
    try {
      const res = await api.post(`/admin/students/${params.id}/counselor-notes`, {
        counselor_notes: counselorNotes,
      });
      setRecommendation(res.data.data);
      toast({
        title: "Catatan Disimpan",
        description: "Catatan bimbingan konseling berhasil disimpan dan dapat dilihat siswa.",
        type: "success",
      });
    } catch (error: any) {
      toast({
        title: "Gagal menyimpan catatan",
        description: error.appMessage || "Terjadi kesalahan.",
        type: "error",
      });
    } finally {
      setSavingNotes(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  if (!student) {
    return (
      <div className="space-y-4 p-6 text-center">
        <div className="nb-card p-12">
          <p className="font-black text-red-600">Data siswa tidak ditemukan.</p>
          <Button asChild variant="plain" className="mt-4">
            <Link href="/admin/siswa">Kembali ke Daftar Siswa</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back button, Title & PDF Print Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b-4 border-black pb-4 print:hidden">
        <div>
          <div className="inline-block nb-badge mb-1 bg-yellow-300 text-xs">
            Detail Profil Siswa
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight">
            {student.name}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {recommendation && (
            <PrintableReport student={student} recommendation={recommendation} />
          )}
          <Button asChild variant="plain" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Link href="/admin/siswa">
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Link>
          </Button>
        </div>
      </div>

      {/* Student Identity Card */}
      <div className="nb-card bg-white p-4 sm:p-6 print:hidden">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="text-[11px] sm:text-xs font-black uppercase text-gray-500">NISN</span>
            <p className="font-mono text-sm sm:text-base md:text-lg font-black text-black">{student.nisn}</p>
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-black uppercase text-gray-500">Kelas</span>
            <p className="text-sm sm:text-base md:text-lg font-black text-black">
              <span className="nb-badge bg-yellow-300 text-xs">{student.class || "-"}</span>
            </p>
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-black uppercase text-gray-500">Asal Sekolah</span>
            <p className="flex items-center gap-1.5 font-black text-black text-xs sm:text-sm truncate">
              <School className="h-4 w-4 text-pink-600 shrink-0" />
              {student.school?.name || "-"}
            </p>
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-black uppercase text-gray-500">Email & Status</span>
            <p className="text-xs sm:text-sm font-bold text-gray-700 truncate">{student.email || "-"}</p>
            <div className="mt-1">
              {student.is_active ? (
                <span className="nb-badge bg-green-300 text-[11px]">Akun Aktif</span>
              ) : (
                <span className="nb-badge bg-red-300 text-[11px]">Nonaktif</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 border-b-2 border-black pb-2 print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("rekomendasi")}
          className={`flex items-center justify-center gap-2 border-2 border-black px-3 sm:px-4 py-2 text-xs sm:text-sm font-black transition-colors ${
            activeTab === "rekomendasi"
              ? "bg-yellow-400"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          <Trophy className="h-4 w-4 shrink-0" />
          Hasil Rekomendasi Karir
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rapor")}
          className={`flex items-center justify-center gap-2 border-2 border-black px-3 sm:px-4 py-2 text-xs sm:text-sm font-black transition-colors ${
            activeTab === "rapor" ? "bg-yellow-400" : "bg-white hover:bg-gray-100"
          }`}
        >
          <BookOpen className="h-4 w-4 shrink-0" />
          Nilai Rapor ({scores.length} Mapel)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("kuesioner")}
          className={`flex items-center justify-center gap-2 border-2 border-black px-3 sm:px-4 py-2 text-xs sm:text-sm font-black transition-colors ${
            activeTab === "kuesioner"
              ? "bg-yellow-400"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          <ClipboardList className="h-4 w-4 shrink-0" />
          Kuesioner Minat ({answers.length} Terjawab)
        </button>
      </div>

      {/* Tab Content: Rekomendasi */}
      {activeTab === "rekomendasi" && (
        <div className="space-y-6 print:hidden">
          {!recommendation || recommendation.results?.length === 0 ? (
            <div className="nb-card p-8 sm:p-12 text-center">
              <Trophy className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              <p className="mt-3 font-black text-gray-700 text-sm sm:text-base">
                Siswa belum menyelesaikan proses perhitungan rekomendasi.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Rekomendasi dapat dihitung setelah siswa melengkapi nilai rapor dan mengisi kuesioner minat.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top 1 Highlight Card */}
              {recommendation.results[0] && (
                <div className="nb-card bg-yellow-300 p-5 sm:p-6 border-4 border-black">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="nb-badge bg-pink-400 text-white font-black text-xs">
                      🏆 Rekomendasi Teratas (#1)
                    </span>
                    <span className="nb-badge bg-white text-xs font-mono font-black">
                      Skor SAW: {recommendation.results[0].preference_value}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-black">
                    {recommendation.results[0].program?.name}
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-gray-800 mt-1">
                    Fakultas / Rumpun: {recommendation.results[0].program?.faculty || "-"}
                  </p>
                </div>
              )}

              {/* Counselor Note Section */}
              <div className="nb-card bg-purple-50 p-5 sm:p-6 border-4 border-black">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquareQuote className="h-5 w-5 text-purple-700" />
                  <h3 className="text-base sm:text-lg font-black uppercase text-black">
                    Catatan & Rekomendasi Guru BK
                  </h3>
                </div>
                <p className="text-xs text-gray-600 mb-3 font-medium">
                  Tuliskan evaluasi, saran pemilihan PTN, maupun langkah tindak lanjut bagi siswa ini. Catatan ini akan tampil di dashboard siswa dan dicetak pada laporan resmi.
                </p>

                <form onSubmit={handleSaveCounselorNote} className="space-y-3">
                  <textarea
                    value={counselorNotes}
                    onChange={(e) => setCounselorNotes(e.target.value)}
                    placeholder="Contoh: Berdasarkan hasil analisis SAW, siswa sangat direkomendasikan memilih Ilmu Komputer di ITB atau Unpad. Tingkatkan konsistensi nilai Matematika di semester 6..."
                    className="nb-input min-h-24 text-xs sm:text-sm"
                    rows={3}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="text-[11px] font-bold text-gray-600">
                      {recommendation.counselor_reviewed_at && (
                        <span>
                          Terakhir disimpan oleh: <strong>{recommendation.counselor?.name || "Guru BK"}</strong> pada{" "}
                          {new Date(recommendation.counselor_reviewed_at).toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={savingNotes}
                      className="flex items-center justify-center gap-2 text-xs w-full sm:w-auto"
                    >
                      <Save className="h-4 w-4" />
                      {savingNotes ? "Menyimpan..." : "Simpan Catatan BK"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Timestamp & Calculation info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-xs sm:text-sm font-bold text-gray-700">
                  Dihitung pada:{" "}
                  <span className="font-mono font-black">
                    {new Date(recommendation.calculated_at).toLocaleString("id-ID")}
                  </span>
                </p>
                <span className="nb-badge bg-purple-300 text-xs w-fit">
                  Metode SAW (Simple Additive Weighting)
                </span>
              </div>

              {/* Rank Cards */}
              <div className="space-y-4">
                {recommendation.results.map((result) => (
                  <RankCard key={result.id} result={result} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Rapor (Format Asli Angket Nilai Rapor SMAN 18 Garut) */}
      {activeTab === "rapor" && (
        <div className="space-y-4 sm:space-y-6 print:hidden">
          {scores.length === 0 ? (
            <div className="nb-card p-8 sm:p-12 text-center">
              <BookOpen className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              <p className="mt-3 font-black text-gray-700 text-sm sm:text-base">
                Siswa belum menginputkan nilai rapor.
              </p>
            </div>
          ) : (
            <>
              {/* Header Box Angket Identitas */}
              <div className="border-4 border-black bg-white p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000]">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 sm:gap-4 pb-3 border-b-2 border-black">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black">
                      NILAI MATA PELAJARAN
                    </h3>
                    <p className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase">
                      Lampiran Angket Nilai Siswa • SMAN 18 Garut
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1 w-full md:w-auto">
                    <span className="text-xs font-black italic text-gray-600">Lampiran</span>
                    <div className="border-2 border-black p-2.5 bg-yellow-50 w-full md:min-w-60 text-xs font-bold space-y-1">
                      <div className="flex items-center justify-between gap-2 border-b border-black/20 pb-1">
                        <span className="text-gray-600">Nama:</span>
                        <strong className="text-black font-black font-mono truncate max-w-[180px]">
                          {student.name}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-600">Kls:</span>
                        <strong className="text-black font-black font-mono">{student.class || "-"}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 text-xs text-gray-800 font-medium">
                  <p className="font-bold text-black">Petunjuk:</p>
                  <ol className="list-decimal list-inside space-y-0.5 mt-0.5">
                    <li>Angka nilai rapor untuk semua mata pelajaran dari semester 1 s.d 5.</li>
                    <li>
                      Jumlah nilai (<strong>Σ</strong>) dan <strong>Re-rata</strong> dihitung secara otomatis oleh sistem.
                    </li>
                  </ol>
                </div>
              </div>

              {/* TABEL 1: Mata Pelajaran (1 s/d 19) */}
              <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_#000] overflow-hidden">
                {/* Mobile scroll hint */}
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-yellow-300 border-b-2 border-black text-[11px] font-black text-black md:hidden">
                  <span className="flex items-center gap-1">
                    <MoveHorizontal className="h-3.5 w-3.5 shrink-0" /> Geser tabel untuk melihat semua semester
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm border-collapse min-w-[580px] sm:min-w-[640px]">
                    <thead>
                      <tr className="border-b-2 border-black bg-gray-100 text-black">
                        <th rowSpan={2} className="border-r-2 border-black p-2 text-center w-10 sm:w-12 font-black">
                          No
                        </th>
                        <th rowSpan={2} className="border-r-2 border-black p-2 text-left min-w-[140px] sm:min-w-[180px] font-black">
                          Mata pelajaran
                        </th>
                        <th colSpan={5} className="border-r-2 border-black p-1 text-center font-black bg-blue-50">
                          Nilai Semester
                        </th>
                        <th rowSpan={2} className="border-r-2 border-black p-2 text-center w-16 sm:w-20 font-black bg-yellow-100">
                          Σ
                        </th>
                        <th rowSpan={2} className="p-2 text-center w-20 sm:w-24 font-black bg-green-100">
                          Re-rata
                        </th>
                      </tr>
                      <tr className="border-b-2 border-black bg-gray-50 text-[11px] text-gray-800 font-bold">
                        <th className="border-r border-black p-1 text-center w-12 sm:w-14 font-black">I</th>
                        <th className="border-r border-black p-1 text-center w-12 sm:w-14 font-black">II</th>
                        <th className="border-r border-black p-1 text-center w-12 sm:w-14 font-black">III</th>
                        <th className="border-r border-black p-1 text-center w-12 sm:w-14 font-black">IV</th>
                        <th className="border-r-2 border-black p-1 text-center w-12 sm:w-14 font-black">V</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scores
                        .filter((s) => (s.subject?.id || s.subject_id) <= 19)
                        .map((s, index) => {
                          const semArray = [s.sem1, s.sem2, s.sem3, s.sem4, s.sem5]
                            .filter((v) => v !== null && v !== undefined && v !== "" && !isNaN(Number(v)))
                            .map((v) => Number(v));

                          const sum = semArray.length > 0
                            ? semArray.reduce((a, b) => a + b, 0)
                            : (s.score ? Number(s.score) : 0);

                          const avg = semArray.length > 0
                            ? sum / semArray.length
                            : (s.score ? Number(s.score) : 0);

                          return (
                            <tr
                              key={s.id}
                              className="border-b border-black/30 hover:bg-yellow-50/50 transition-colors"
                            >
                              <td className="border-r-2 border-black p-1.5 sm:p-2 text-center font-bold text-xs">
                                {index + 1}
                              </td>
                              <td className="border-r-2 border-black p-1.5 sm:p-2 font-bold text-black text-xs sm:text-sm">
                                {s.subject?.name || "-"}
                              </td>

                              <td className="border-r border-black p-1 sm:p-1.5 text-center font-mono font-bold">
                                {s.sem1 !== null && s.sem1 !== undefined && s.sem1 !== "" ? Number(s.sem1) : "-"}
                              </td>
                              <td className="border-r border-black p-1 sm:p-1.5 text-center font-mono font-bold">
                                {s.sem2 !== null && s.sem2 !== undefined && s.sem2 !== "" ? Number(s.sem2) : "-"}
                              </td>
                              <td className="border-r border-black p-1 sm:p-1.5 text-center font-mono font-bold">
                                {s.sem3 !== null && s.sem3 !== undefined && s.sem3 !== "" ? Number(s.sem3) : "-"}
                              </td>
                              <td className="border-r border-black p-1 sm:p-1.5 text-center font-mono font-bold">
                                {s.sem4 !== null && s.sem4 !== undefined && s.sem4 !== "" ? Number(s.sem4) : "-"}
                              </td>
                              <td className="border-r-2 border-black p-1 sm:p-1.5 text-center font-mono font-bold">
                                {s.sem5 !== null && s.sem5 !== undefined && s.sem5 !== "" ? Number(s.sem5) : "-"}
                              </td>

                              <td className="border-r-2 border-black p-1.5 sm:p-2 text-center font-mono font-bold text-xs bg-yellow-50/60">
                                {sum > 0 ? sum.toFixed(0) : "-"}
                              </td>

                              <td className="p-1.5 sm:p-2 text-center font-mono font-black text-xs sm:text-sm bg-green-50/60 text-green-950">
                                {avg > 0 ? avg.toFixed(1) : (s.score ? Number(s.score).toFixed(1) : "-")}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABEL 2: IPA & IPS */}
              {scores.some((s) => (s.subject?.id || s.subject_id) >= 20) && (
                <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_#000] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm border-collapse min-w-[580px] sm:min-w-[640px]">
                      <thead>
                        <tr className="border-b-2 border-black bg-gray-100 text-black">
                          <th rowSpan={2} className="border-r-2 border-black p-2 text-center w-10 sm:w-12 font-black">
                            No
                          </th>
                          <th rowSpan={2} className="border-r-2 border-black p-2 text-left min-w-[140px] sm:min-w-[180px] font-black">
                            Mata pelajaran
                          </th>
                          <th colSpan={5} className="border-r-2 border-black p-1 text-center font-black bg-blue-50">
                            Nilai Semester
                          </th>
                          <th rowSpan={2} className="border-r-2 border-black p-2 text-center w-16 sm:w-20 font-black bg-yellow-100">
                            Σ
                          </th>
                          <th rowSpan={2} className="p-2 text-center w-20 sm:w-24 font-black bg-green-100">
                            Re-rata
                          </th>
                        </tr>
                        <tr className="border-b-2 border-black bg-gray-50 text-[11px] text-gray-800 font-bold">
                          <th className="border-r border-black p-1 text-center w-12 sm:w-14 font-black">I</th>
                          <th className="border-r border-black p-1 text-center w-12 sm:w-14 font-black">II</th>
                          <th className="border-r border-black p-1 text-center w-12 sm:w-14 font-black">III</th>
                          <th className="border-r border-black p-1 text-center w-12 sm:w-14 font-black">IV</th>
                          <th className="border-r-2 border-black p-1 text-center w-12 sm:w-14 font-black">V</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scores
                          .filter((s) => (s.subject?.id || s.subject_id) >= 20)
                          .map((s, index) => {
                            const semArray = [s.sem1, s.sem2, s.sem3, s.sem4, s.sem5]
                              .filter((v) => v !== null && v !== undefined && v !== "" && !isNaN(Number(v)))
                              .map((v) => Number(v));

                            const sum = semArray.length > 0
                              ? semArray.reduce((a, b) => a + b, 0)
                              : (s.score ? Number(s.score) : 0);

                            const avg = semArray.length > 0
                              ? sum / semArray.length
                              : (s.score ? Number(s.score) : 0);

                            return (
                              <tr
                                key={s.id}
                                className="border-b border-black/30 hover:bg-yellow-50/50 transition-colors"
                              >
                                <td className="border-r-2 border-black p-1.5 sm:p-2 text-center font-bold text-xs">
                                  {index + 1}
                                </td>
                                <td className="border-r-2 border-black p-1.5 sm:p-2 font-bold text-black text-xs sm:text-sm">
                                  {s.subject?.name || "-"}
                                </td>

                                <td className="border-r border-black p-1 sm:p-1.5 text-center font-mono font-bold">
                                  {s.sem1 !== null && s.sem1 !== undefined && s.sem1 !== "" ? Number(s.sem1) : "-"}
                                </td>
                                <td className="border-r border-black p-1 sm:p-1.5 text-center font-mono font-bold">
                                  {s.sem2 !== null && s.sem2 !== undefined && s.sem2 !== "" ? Number(s.sem2) : "-"}
                                </td>
                                <td className="border-r border-black p-1 sm:p-1.5 text-center font-mono font-bold">
                                  {s.sem3 !== null && s.sem3 !== undefined && s.sem3 !== "" ? Number(s.sem3) : "-"}
                                </td>
                                <td className="border-r border-black p-1 sm:p-1.5 text-center font-mono font-bold">
                                  {s.sem4 !== null && s.sem4 !== undefined && s.sem4 !== "" ? Number(s.sem4) : "-"}
                                </td>
                                <td className="border-r-2 border-black p-1 sm:p-1.5 text-center font-mono font-bold">
                                  {s.sem5 !== null && s.sem5 !== undefined && s.sem5 !== "" ? Number(s.sem5) : "-"}
                                </td>

                                <td className="border-r-2 border-black p-1.5 sm:p-2 text-center font-mono font-bold text-xs bg-yellow-50/60">
                                  {sum > 0 ? sum.toFixed(0) : "-"}
                                </td>

                                <td className="p-1.5 sm:p-2 text-center font-mono font-black text-xs sm:text-sm bg-green-50/60 text-green-950">
                                  {avg > 0 ? avg.toFixed(1) : (s.score ? Number(s.score).toFixed(1) : "-")}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab Content: Kuesioner */}
      {activeTab === "kuesioner" && (
        <div className="space-y-4 print:hidden">
          {answers.length === 0 ? (
            <div className="nb-card p-8 sm:p-12 text-center">
              <ClipboardList className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              <p className="mt-3 font-black text-gray-700 text-sm sm:text-base">
                Siswa belum mengisi kuesioner minat karir.
              </p>
            </div>
          ) : (
            <div className="nb-card overflow-x-auto p-0">
              <table className="nb-table w-full min-w-[500px]">
                <thead>
                  <tr>
                    <th className="w-12 text-center">No</th>
                    <th>Pertanyaan Minat</th>
                    <th>Kategori Minat</th>
                    <th className="text-center w-36">Jawaban Siswa</th>
                  </tr>
                </thead>
                <tbody>
                  {answers.map((ans, idx) => (
                    <tr key={ans.id}>
                      <td className="font-bold text-center">{idx + 1}</td>
                      <td>
                        <p className="font-bold text-xs sm:text-sm">
                          {ans.question?.question || `Pertanyaan #${ans.question_id}`}
                        </p>
                      </td>
                      <td>
                        <span className="nb-badge bg-purple-200 text-xs">
                          {ans.question?.category?.name || "-"}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="nb-badge bg-yellow-300 font-mono font-black text-xs">
                          Skor {ans.score} / 5
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Printable Report element for printing directly from Admin */}
      <PrintableReport student={student} recommendation={recommendation} />
    </div>
  );
}
