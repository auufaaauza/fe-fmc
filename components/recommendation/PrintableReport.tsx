"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Printer } from "lucide-react";
import { api } from "@/lib/axios";
import type { Recommendation, StudentScore, User } from "@/types";
import { Button } from "@/components/ui/button";

interface PrintableReportProps {
  student: User | null;
  recommendation: Recommendation | null;
  scores?: StudentScore[];
}

export function PrintableReport({
  student,
  recommendation,
  scores: initialScores,
}: PrintableReportProps) {
  const [scores, setScores] = useState<StudentScore[]>(initialScores || []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isValidated = Boolean(
    recommendation?.is_validated ||
      (recommendation?.counselor_reviewed_at && recommendation?.counselor_notes)
  );

  useEffect(() => {
    if (initialScores && initialScores.length > 0) {
      setScores(initialScores);
      return;
    }

    async function loadScores() {
      try {
        if (student?.id) {
          try {
            const res = await api.get(`/students/${student.id}/scores`);
            if (res.data?.data) {
              setScores(res.data.data);
              return;
            }
          } catch {
            // fallback to /my-scores if endpoint inaccessible
          }
        }
        const res = await api.get("/my-scores");
        if (res.data?.data) {
          setScores(res.data.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data nilai untuk cetak laporan:", err);
      }
    }

    if (recommendation && isValidated) {
      loadScores();
    }
  }, [initialScores, student?.id, recommendation, isValidated]);

  if (!recommendation || !isValidated || !recommendation.results || recommendation.results.length === 0) {
    return null;
  }

  const topResults = recommendation.results.slice(0, 5);

  // Filter mata pelajaran yang terisi
  const filledScores = scores.filter((s) => {
    const hasSem = [s.sem1, s.sem2, s.sem3, s.sem4, s.sem5].some(
      (v) => v !== null && v !== undefined && v !== ""
    );
    const hasScore = s.score !== null && s.score !== undefined && s.score !== "";
    return hasSem || hasScore;
  });

  function handlePrint() {
    window.print();
  }

  const analysisDate = recommendation.calculated_at
    ? new Date(recommendation.calculated_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* Tombol Cetak (Hanya tampil di layar) */}
      <Button
        onClick={handlePrint}
        variant="glass"
        className="flex items-center gap-2 text-xs sm:text-sm print:hidden"
      >
        <Printer className="h-4 w-4" />
        <span>Cetak Laporan PDF</span>
      </Button>

      {/* ── LEMBAR LAPORAN RESMI A4 (Portaled ke document.body) ── */}
      {mounted && typeof document !== "undefined" && createPortal(
        <div
          id="printable-report-root"
          className="w-full max-w-4xl mx-auto p-4 text-black font-sans bg-white"
        >
          {/* Header Dokumen (Tanpa KOP Surat) */}
          <div className="text-center pb-3 mb-4 border-b-2 border-black">
          <h2 className="font-bold text-base uppercase tracking-tight text-black">
            Laporan Hasil Rekomendasi Pemilihan Program Studi & Karir
          </h2>
          <p className="text-[11px] text-gray-700 mt-0.5">
            Sistem Rekomendasi Berdasarkan Analisis Nilai Rapor & Kuesioner Minat RIASEC (Metode Simple Additive Weighting)
          </p>
        </div>

        {/* Identitas Siswa */}
        <div className="border border-black p-3 mb-4 text-xs bg-gray-50/50">
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-6">
            <div>
              <span className="text-gray-600">Nama Siswa:</span>{" "}
              <strong className="font-bold text-black">{student?.name || "-"}</strong>
            </div>
            <div>
              <span className="text-gray-600">NISN:</span>{" "}
              <strong className="font-mono font-bold text-black">{student?.nisn || "-"}</strong>
            </div>
            <div>
              <span className="text-gray-600">Kelas:</span>{" "}
              <strong className="font-bold text-black">{student?.class || "-"}</strong>
            </div>
            <div>
              <span className="text-gray-600">Tanggal Analisis:</span>{" "}
              <strong className="font-bold text-black">{analysisDate}</strong>
            </div>
          </div>
        </div>

        {/* ── 1. CATATAN & ARAHAN REKOMENDASI GURU BK ── */}
        <div className="border border-black p-3.5 mb-4 text-xs bg-yellow-50/30 break-inside-avoid">
          <h3 className="font-bold text-xs uppercase mb-1 text-black flex items-center justify-between">
            <span>I. Catatan & Arahan Rekomendasi Guru BK</span>
            <span className="text-[10px] font-normal text-gray-600">Status: Tervalidasi</span>
          </h3>
          <div className="p-2.5 bg-white border border-gray-300 rounded mt-1">
            <p className="text-gray-900 italic leading-relaxed text-xs">
              {recommendation.counselor_notes
                ? `"${recommendation.counselor_notes}"`
                : "Siswa telah menyelesaikan pengisian nilai rapor dan kuesioner minat. Disarankan berdiskusi langsung dengan Guru Bimbingan Konseling untuk penentuan strategi pilihan program studi."}
            </p>
          </div>
          {recommendation.counselor && (
            <p className="text-[11px] text-gray-700 font-semibold mt-1.5 text-right">
              Ditinjau oleh: {recommendation.counselor.name}
              {recommendation.counselor_reviewed_at &&
                ` (${new Date(recommendation.counselor_reviewed_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })})`}
            </p>
          )}
        </div>

        {/* ── 2. HASIL REKOMENDASI PROGRAM STUDI ── */}
        <div className="mb-4 break-inside-avoid">
          <h3 className="font-bold text-xs uppercase mb-1.5 text-black">
            II. Hasil Rekomendasi Program Studi Pilihan (Top Rekomendasi)
          </h3>
          <table className="w-full text-xs border-collapse border border-black mb-2.5">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black p-1.5 text-center w-12 font-bold">Peringkat</th>
                <th className="border border-black p-1.5 text-left font-bold">Program Studi / Jurusan</th>
                <th className="border border-black p-1.5 text-left font-bold">Fakultas / Rumpun</th>
                <th className="border border-black p-1.5 text-left font-bold">Mata Pelajaran Pendukung</th>
                <th className="border border-black p-1.5 text-center w-24 font-bold">Skor SAW (Vi)</th>
              </tr>
            </thead>
            <tbody>
              {topResults.map((res) => (
                <tr key={res.id}>
                  <td className="border border-black p-1.5 text-center font-bold">
                    #{res.rank_position}
                  </td>
                  <td className="border border-black p-1.5 font-bold text-black">
                    {res.program.name}
                  </td>
                  <td className="border border-black p-1.5 text-gray-800">
                    {res.program.faculty || "-"}
                  </td>
                  <td className="border border-black p-1.5 text-gray-800">
                    {res.program.criteria?.primary_subject?.name || "-"}
                    {res.program.criteria?.secondary_subject
                      ? `, ${res.program.criteria.secondary_subject.name}`
                      : ""}
                  </td>
                  <td className="border border-black p-1.5 text-center font-mono font-bold">
                    {Number(res.preference_value).toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {topResults[0]?.program?.career_paths && topResults[0].program.career_paths.length > 0 && (
            <div className="border border-black p-2 text-xs bg-gray-50">
              <span className="font-bold text-black">
                Prospek Karir Rekomendasi Utama ({topResults[0].program.name}):
              </span>{" "}
              <span className="text-gray-800">
                {topResults[0].program.career_paths.join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* ── 3. NILAI RAPOR YANG SUDAH DIINPUT ── */}
        <div className="mb-5 break-inside-avoid">
          <h3 className="font-bold text-xs uppercase mb-1.5 text-black">
            III. Rincian Nilai Rapor Siswa yang Diinputkan
          </h3>
          {filledScores.length === 0 ? (
            <div className="border border-black p-3 text-center text-xs text-gray-600">
              Data rincian nilai rapor tidak tersedia atau belum diinput.
            </div>
          ) : (
            <table className="w-full text-xs border-collapse border border-black">
              <thead>
                <tr className="bg-gray-200">
                  <th rowSpan={2} className="border border-black p-1 text-center w-8 font-bold">No</th>
                  <th rowSpan={2} className="border border-black p-1 text-left font-bold">Mata Pelajaran</th>
                  <th colSpan={5} className="border border-black p-1 text-center font-bold">Nilai Rapor Per Semester</th>
                  <th rowSpan={2} className="border border-black p-1 text-center w-16 font-bold">Rata-rata</th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="border border-black p-1 text-center w-10 font-medium">Sem 1</th>
                  <th className="border border-black p-1 text-center w-10 font-medium">Sem 2</th>
                  <th className="border border-black p-1 text-center w-10 font-medium">Sem 3</th>
                  <th className="border border-black p-1 text-center w-10 font-medium">Sem 4</th>
                  <th className="border border-black p-1 text-center w-10 font-medium">Sem 5</th>
                </tr>
              </thead>
              <tbody>
                {filledScores.map((item, idx) => (
                  <tr key={item.id || idx} className={idx % 2 === 1 ? "bg-gray-50/50" : ""}>
                    <td className="border border-black p-1 text-center">{idx + 1}</td>
                    <td className="border border-black p-1 font-medium text-black">
                      {item.subject?.name || `Mata Pelajaran #${item.subject_id}`}
                    </td>
                    <td className="border border-black p-1 text-center font-mono">{item.sem1 ?? "-"}</td>
                    <td className="border border-black p-1 text-center font-mono">{item.sem2 ?? "-"}</td>
                    <td className="border border-black p-1 text-center font-mono">{item.sem3 ?? "-"}</td>
                    <td className="border border-black p-1 text-center font-mono">{item.sem4 ?? "-"}</td>
                    <td className="border border-black p-1 text-center font-mono">{item.sem5 ?? "-"}</td>
                    <td className="border border-black p-1 text-center font-bold font-mono">
                      {item.score !== null && item.score !== undefined && item.score !== ""
                        ? Number(item.score).toFixed(1)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── 4. TANDA TANGAN GURU BK DI BAWAH ── */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs mt-6 pt-2 break-inside-avoid">
          <div>
            <p className="text-gray-700">Siswa yang bersangkutan,</p>
            <div className="h-16" />
            <p className="font-bold underline text-black">{student?.name || "........................................"}</p>
            <p className="text-gray-600 font-mono">NISN: {student?.nisn || "-"}</p>
          </div>

          <div>
            <p className="text-gray-700">
              Garut, {printDate}
            </p>
            <p className="text-gray-700">Guru Bimbingan Konseling (BK),</p>
            <div className="h-16" />
            <p className="font-bold underline text-black">
              {recommendation.counselor?.name || "Guru Bimbingan Konseling"}
            </p>
            <p className="text-gray-600">NIP. ........................................</p>
          </div>
        </div>
      </div>,
      document.body
    )}
  </>
  );
}
