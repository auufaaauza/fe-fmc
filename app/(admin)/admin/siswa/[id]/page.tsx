"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  GraduationCap,
  MessageSquareQuote,
  MoveHorizontal,
  Save,
  School,
  ShieldCheck,
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

type Tab = "rekomendasi" | "rapor" | "kuesioner";

export default function AdminStudentDetailPage() {
  const params = useParams<{ id: string }>();
  const [student, setStudent] = useState<UserType | null>(null);
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("rekomendasi");
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
        if (rec?.counselor_notes) setCounselorNotes(rec.counselor_notes);
      } catch (error: any) {
        toast({ title: "Gagal memuat detail siswa", description: error.appMessage || "Terjadi kesalahan.", type: "error" });
      } finally { setLoading(false); }
    }
    loadDetail();
  }, [params.id, toast]);

  async function handleSaveCounselorNote(e: FormEvent) {
    e.preventDefault();
    if (!counselorNotes.trim()) {
      toast({ title: "Validasi Gagal", description: "Catatan tidak boleh kosong.", type: "error" });
      return;
    }
    setSavingNotes(true);
    try {
      const res = await api.post(`/admin/students/${params.id}/counselor-notes`, { counselor_notes: counselorNotes });
      setRecommendation((prev) => ({
        ...(prev || {}),
        ...res.data.data,
        results: res.data.data?.results || prev?.results || [],
      }));
      toast({ title: "Berhasil Divalidasi", description: "Catatan disimpan dan hasil rekomendasi kini dapat dilihat siswa.", type: "success" });
    } catch (error: any) {
      toast({ title: "Gagal menyimpan", description: error.appMessage || "Terjadi kesalahan.", type: "error" });
    } finally { setSavingNotes(false); }
  }

  if (loading) return <LoadingSpinner />;

  if (!student) {
    return (
      <div className="p-6 text-center">
        <div className="nb-card p-12">
          <XCircle className="mx-auto h-12 w-12 text-red-400 mb-3" />
          <p className="font-medium text-slate-700">Data siswa tidak ditemukan.</p>
          <Button asChild variant="plain" className="mt-4">
            <Link href="/admin/siswa">Kembali ke Daftar Siswa</Link>
          </Button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof Trophy; count?: number }[] = [
    { key: "rekomendasi", label: "Hasil Rekomendasi", icon: Trophy },
    { key: "rapor", label: `Nilai Rapor (${scores.length} Mapel)`, icon: BookOpen },
    { key: "kuesioner", label: `Kuesioner (${answers.length} Jawaban)`, icon: ClipboardList },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Back + Title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 print:hidden">
        <div>
          <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 mb-2">
            Detail Profil Siswa
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">{student.name}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {recommendation && <PrintableReport student={student} recommendation={recommendation} />}
          <Button asChild variant="plain" size="sm" className="flex items-center gap-1.5">
            <Link href="/admin/siswa"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
          </Button>
        </div>
      </div>

      {/* Student Identity Card */}
      <div className="nb-card p-4 sm:p-5 print:hidden">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">NISN</span>
            <p className="font-mono text-sm font-semibold text-slate-900 mt-0.5">{student.nisn}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Kelas</span>
            <p className="mt-0.5">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {student.class || "-"}
              </span>
            </p>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Asal Sekolah</span>
            <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mt-0.5 truncate">
              <School className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              {student.school?.name || "-"}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Status</span>
            <p className="mt-0.5">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                student.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
              }`}>
                {student.is_active ? "Akun Aktif" : "Nonaktif"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 print:hidden">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 rounded-t-lg px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: Rekomendasi ── */}
      {activeTab === "rekomendasi" && (
        <div className="space-y-6 print:hidden">
          {!recommendation || !recommendation.results || recommendation.results.length === 0 ? (
            <div className="nb-card p-8 sm:p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Trophy className="h-7 w-7 text-slate-400" />
              </div>
              <p className="font-medium text-slate-700">Siswa belum menyelesaikan perhitungan rekomendasi.</p>
              <p className="mt-1 text-xs text-slate-400">
                Rekomendasi dapat dihitung setelah siswa melengkapi nilai rapor dan kuesioner.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Top 1 Highlight */}
              {recommendation.results?.[0] && (
                <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 p-5 sm:p-6 text-white shadow-lg">
                  <div className="flex items-center gap-2 text-xs text-indigo-200 mb-2">
                    <GraduationCap className="h-4 w-4" />
                    <span className="font-medium">🏆 Rekomendasi Teratas (#1)</span>
                    <span className="ml-auto font-mono text-xs bg-white/20 rounded-full px-2 py-0.5">
                      SAW: {Number(recommendation.results[0].preference_value).toFixed(4)}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-white">
                    {recommendation.results[0].program?.name}
                  </h2>
                  <p className="text-xs text-indigo-200 mt-1">
                    {recommendation.results[0].program?.faculty || "-"}
                  </p>
                </div>
              )}

              {/* ── Validation Status ── */}
              {recommendation.is_validated ? (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2.5">
                  <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
                  <p className="text-xs text-green-700">
                    Sudah divalidasi oleh{" "}
                    <strong>{recommendation.counselor?.name || "Guru BK"}</strong> pada{" "}
                    {recommendation.counselor_reviewed_at
                      ? new Date(recommendation.counselor_reviewed_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric",
                        })
                      : "-"}
                    . Siswa sudah bisa melihat hasil rekomendasi ini.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5">
                  <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Rekomendasi <strong>belum divalidasi</strong>. Isi catatan di bawah dan klik
                    &ldquo;Validasi &amp; Simpan Catatan&rdquo; agar siswa dapat melihat hasilnya.
                  </p>
                </div>
              )}

              {/* ── Counselor Note Form ── */}
              <div className={`nb-card p-5 sm:p-6 ${recommendation.is_validated ? "border-green-200 bg-green-50/30" : "border-indigo-200 bg-indigo-50/20"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquareQuote className={`h-5 w-5 ${recommendation.is_validated ? "text-green-600" : "text-indigo-500"}`} />
                  <h3 className="text-sm font-semibold text-slate-900">
                    {recommendation.is_validated ? "Catatan Rekomendasi (Tervalidasi)" : "Validasi & Catatan Rekomendasi"}
                  </h3>
                  {recommendation.is_validated && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      <ShieldCheck className="h-3 w-3" /> Tervalidasi
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  {recommendation.is_validated
                    ? "Catatan ini sudah dikirimkan ke siswa. Anda bisa mengubahnya kapan saja."
                    : "Tuliskan evaluasi, saran pemilihan PTN, dan arahan bagi siswa. Klik tombol validasi untuk mengirimkan hasilnya ke siswa."}
                </p>

                <form onSubmit={handleSaveCounselorNote} className="space-y-3">
                  <textarea
                    value={counselorNotes}
                    onChange={(e) => setCounselorNotes(e.target.value)}
                    placeholder="Contoh: Berdasarkan analisis SAW, sangat direkomendasikan memilih Ilmu Komputer di ITB atau Unpad. Tingkatkan nilai Matematika..."
                    className="nb-input min-h-[100px] text-xs sm:text-sm resize-none"
                    rows={4}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    {recommendation.counselor_reviewed_at && (
                      <p className="text-[11px] text-slate-400">
                        Terakhir disimpan oleh <strong>{recommendation.counselor?.name || "Guru BK"}</strong>{" "}
                        pada {new Date(recommendation.counselor_reviewed_at).toLocaleString("id-ID")}
                      </p>
                    )}
                    <Button
                      type="submit"
                      disabled={savingNotes}
                      className={`flex items-center justify-center gap-2 text-xs w-full sm:w-auto ${
                        recommendation.is_validated
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      } text-white`}
                    >
                      {recommendation.is_validated ? (
                        <ShieldCheck className="h-4 w-4" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {savingNotes
                        ? "Menyimpan..."
                        : recommendation.is_validated
                          ? "Perbarui Catatan"
                          : "Validasi & Simpan Catatan"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Timestamp */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-xs text-slate-500">
                  Dihitung pada:{" "}
                  <span className="font-mono font-medium text-slate-700">
                    {new Date(recommendation.calculated_at).toLocaleString("id-ID")}
                  </span>
                </p>
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                  Metode SAW
                </span>
              </div>

              {/* Rank Cards */}
              <div className="space-y-4">
                {recommendation.results?.map((result) => (
                  <RankCard key={result.id} result={result} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Rapor ── */}
      {activeTab === "rapor" && (
        <div className="space-y-5 print:hidden">
          {scores.length === 0 ? (
            <div className="nb-card p-8 sm:p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="font-medium text-slate-700">Siswa belum menginputkan nilai rapor.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="nb-card p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">NILAI MATA PELAJARAN</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Lampiran Angket Nilai Siswa</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-1 min-w-[200px]">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Nama:</span>
                      <strong className="text-slate-800 font-mono truncate max-w-[140px]">{student.name}</strong>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Kelas:</span>
                      <strong className="text-slate-800 font-mono">{student.class || "-"}</strong>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Petunjuk:</span> Nilai rapor semester 1-5. Jumlah dan rata-rata dihitung otomatis.
                </p>
              </div>

              {/* Scroll hint mobile */}
              <div className="flex items-center gap-2 text-xs text-slate-400 sm:hidden">
                <MoveHorizontal className="h-3.5 w-3.5 shrink-0" /> Geser tabel untuk melihat semua semester
              </div>

              {/* Table 1: Mapel 1-19 */}
              <div className="nb-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm border-collapse min-w-[580px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th rowSpan={2} className="border-r border-slate-200 p-2 text-center w-10 font-semibold text-slate-600">No</th>
                        <th rowSpan={2} className="border-r border-slate-200 p-2 text-left min-w-[150px] font-semibold text-slate-600">Mata Pelajaran</th>
                        <th colSpan={5} className="border-r border-slate-200 p-1 text-center font-semibold text-slate-600 bg-blue-50/50">Nilai Semester</th>
                        <th rowSpan={2} className="border-r border-slate-200 p-2 text-center w-16 font-semibold text-slate-600 bg-amber-50/50">Jumlah</th>
                        <th rowSpan={2} className="p-2 text-center w-20 font-semibold text-slate-600 bg-green-50/50">Rerata</th>
                      </tr>
                      <tr className="border-b border-slate-200 bg-slate-50/60">
                        {["I","II","III","IV","V"].map((s) => (
                          <th key={s} className="border-r border-slate-200 p-1 text-center w-12 font-semibold text-slate-500 text-xs">{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {scores
                        .filter((s) => (s.subject?.id || s.subject_id) <= 19)
                        .map((s, idx) => {
                          const semArr = [s.sem1, s.sem2, s.sem3, s.sem4, s.sem5]
                            .filter((v) => v !== null && v !== undefined && v !== "" && !isNaN(Number(v)))
                            .map((v) => Number(v));
                          const sum = semArr.length > 0 ? semArr.reduce((a, b) => a + b, 0) : (s.score ? Number(s.score) : 0);
                          const avg = semArr.length > 0 ? sum / semArr.length : (s.score ? Number(s.score) : 0);
                          const semVals = [s.sem1, s.sem2, s.sem3, s.sem4, s.sem5];
                          return (
                            <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                              <td className="border-r border-slate-200 p-2 text-center text-slate-500">{idx + 1}</td>
                              <td className="border-r border-slate-200 p-2 font-medium text-slate-800">{s.subject?.name || "-"}</td>
                              {semVals.map((v, vi) => (
                                <td key={vi} className="border-r border-slate-200 p-1.5 text-center font-mono text-slate-700">
                                  {v !== null && v !== undefined && v !== "" ? Number(v) : <span className="text-slate-300">-</span>}
                                </td>
                              ))}
                              <td className="border-r border-slate-200 p-1.5 text-center font-mono font-medium text-amber-700 bg-amber-50/30">
                                {sum > 0 ? sum.toFixed(0) : "-"}
                              </td>
                              <td className="p-1.5 text-center font-mono font-semibold text-green-700 bg-green-50/30">
                                {avg > 0 ? avg.toFixed(1) : (s.score ? Number(s.score).toFixed(1) : "-")}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Mapel >= 20 */}
              {scores.some((s) => (s.subject?.id || s.subject_id) >= 20) && (
                <div className="nb-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm border-collapse min-w-[580px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th rowSpan={2} className="border-r border-slate-200 p-2 text-center w-10 font-semibold text-slate-600">No</th>
                          <th rowSpan={2} className="border-r border-slate-200 p-2 text-left min-w-[150px] font-semibold text-slate-600">Mata Pelajaran</th>
                          <th colSpan={5} className="border-r border-slate-200 p-1 text-center font-semibold text-slate-600 bg-blue-50/50">Nilai Semester</th>
                          <th rowSpan={2} className="border-r border-slate-200 p-2 text-center w-16 font-semibold text-slate-600 bg-amber-50/50">Jumlah</th>
                          <th rowSpan={2} className="p-2 text-center w-20 font-semibold text-slate-600 bg-green-50/50">Rerata</th>
                        </tr>
                        <tr className="border-b border-slate-200 bg-slate-50/60">
                          {["I","II","III","IV","V"].map((s) => (
                            <th key={s} className="border-r border-slate-200 p-1 text-center w-12 font-semibold text-slate-500 text-xs">{s}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {scores
                          .filter((s) => (s.subject?.id || s.subject_id) >= 20)
                          .map((s, idx) => {
                            const semArr = [s.sem1, s.sem2, s.sem3, s.sem4, s.sem5]
                              .filter((v) => v !== null && v !== undefined && v !== "" && !isNaN(Number(v)))
                              .map((v) => Number(v));
                            const sum = semArr.length > 0 ? semArr.reduce((a, b) => a + b, 0) : (s.score ? Number(s.score) : 0);
                            const avg = semArr.length > 0 ? sum / semArr.length : (s.score ? Number(s.score) : 0);
                            const semVals = [s.sem1, s.sem2, s.sem3, s.sem4, s.sem5];
                            return (
                              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                                <td className="border-r border-slate-200 p-2 text-center text-slate-500">{idx + 1}</td>
                                <td className="border-r border-slate-200 p-2 font-medium text-slate-800">{s.subject?.name || "-"}</td>
                                {semVals.map((v, vi) => (
                                  <td key={vi} className="border-r border-slate-200 p-1.5 text-center font-mono text-slate-700">
                                    {v !== null && v !== undefined && v !== "" ? Number(v) : <span className="text-slate-300">-</span>}
                                  </td>
                                ))}
                                <td className="border-r border-slate-200 p-1.5 text-center font-mono font-medium text-amber-700 bg-amber-50/30">
                                  {sum > 0 ? sum.toFixed(0) : "-"}
                                </td>
                                <td className="p-1.5 text-center font-mono font-semibold text-green-700 bg-green-50/30">
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

      {/* ── Tab: Kuesioner ── */}
      {activeTab === "kuesioner" && (
        <div className="space-y-4 print:hidden">
          {answers.length === 0 ? (
            <div className="nb-card p-8 sm:p-12 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="font-medium text-slate-700">Siswa belum mengisi kuesioner minat karir.</p>
            </div>
          ) : (
            <div className="nb-card overflow-x-auto">
              <table className="nb-table w-full min-w-[500px]">
                <thead>
                  <tr>
                    <th className="w-10 text-center">No</th>
                    <th>Pertanyaan Minat</th>
                    <th>Kategori</th>
                    <th className="text-center w-32">Jawaban</th>
                  </tr>
                </thead>
                <tbody>
                  {answers.map((ans, idx) => (
                    <tr key={ans.id}>
                      <td className="text-center text-slate-400">{idx + 1}</td>
                      <td>
                        <p className="text-xs sm:text-sm text-slate-700">
                          {ans.question?.question || `Pertanyaan #${ans.question_id}`}
                        </p>
                      </td>
                      <td>
                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                          {ans.question?.category?.name || "-"}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-mono font-semibold text-slate-700">
                          {ans.score} / 5
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

      {/* Printable */}
      <PrintableReport student={student} recommendation={recommendation} />
    </div>
  );
}
