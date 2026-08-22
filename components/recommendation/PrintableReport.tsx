"use client";

import { Printer } from "lucide-react";
import type { Recommendation, User } from "@/types";
import { Button } from "@/components/ui/button";

interface PrintableReportProps {
  student: User | null;
  recommendation: Recommendation | null;
}

export function PrintableReport({ student, recommendation }: PrintableReportProps) {
  const isValidated = Boolean(
    recommendation?.is_validated ||
    (recommendation?.counselor_reviewed_at && recommendation?.counselor_notes)
  );

  if (!recommendation || !isValidated || !recommendation.results || recommendation.results.length === 0) {
    return null;
  }

  const topResults = recommendation.results.slice(0, 5);

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {/* Tombol Cetak (Hanya tampil di layar) */}
      <Button
        onClick={handlePrint}
        variant="glass"
        className="flex items-center gap-2 text-xs sm:text-sm print:hidden"
      >
        <Printer className="h-4 w-4" />
        <span>Cetak Laporan PDF Resmi</span>
      </Button>

      {/* ── LEMBAR LAPORAN RESMI A4 (Hanya tampil saat dicetak) ── */}
      <div className="hidden print:block print:w-full print:max-w-4xl print:mx-auto print:p-8 print:text-black font-sans bg-white">
        {/* KOP Surat Resmi SMAN 18 Garut */}
        <div className="border-b-4 border-double border-black pb-4 mb-6 text-center">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-800">
            Pemerintah Daerah Provinsi Jawa Barat
          </h3>
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-800">
            Dinas Pendidikan
          </h3>
          <h2 className="font-black text-lg uppercase tracking-tight mt-0.5 text-black">
            SMA Negeri 18 Garut
          </h2>
          <p className="text-[11px] text-gray-700 mt-1">
            NPSN: 20209182 / Jl. Perum Bumi Abdi Negara 1 Karangpawitan, Kab. Garut, Prov. Jawa Barat
          </p>
          <p className="text-[10px] text-gray-600">
            Laman: sman18garut.sch.id / Surat Elektronik: sman18garut@gmail.com
          </p>
        </div>

        {/* Judul Dokumen */}
        <div className="text-center mb-6">
          <h3 className="font-black text-sm uppercase underline tracking-wide">
            Laporan Rekomendasi Pemilihan Program Studi & Karir
          </h3>
          <p className="text-[11px] text-gray-600 mt-0.5">
            Berdasarkan Integrasi Nilai Rapor & Kuesioner Minat RIASEC (Metode SAW)
          </p>
        </div>

        {/* Identitas Siswa */}
        <div className="border border-black p-3.5 mb-6 text-xs bg-gray-50/50">
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
            <div>
              <span className="text-gray-600">Nama Lengkap:</span>{" "}
              <strong className="font-bold">{student?.name}</strong>
            </div>
            <div>
              <span className="text-gray-600">Nomor Induk Siswa Nasional (NISN):</span>{" "}
              <strong className="font-mono font-bold">{student?.nisn || "-"}</strong>
            </div>
            <div>
              <span className="text-gray-600">Kelas:</span>{" "}
              <strong className="font-bold">{student?.class || "-"}</strong>
            </div>
            <div>
              <span className="text-gray-600">Tanggal Analisis:</span>{" "}
              <strong className="font-bold">
                {new Date(recommendation.calculated_at).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </strong>
            </div>
          </div>
        </div>

        {/* Tabel Rekomendasi Top 5 */}
        <div className="mb-5">
          <h4 className="font-black text-xs uppercase mb-2">
            Hasil Pemeringkatan Program Studi Pilihan (Top Rekomendasi):
          </h4>
          <table className="w-full text-xs border-collapse border border-black">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black p-2 text-center w-12">Peringkat</th>
                <th className="border border-black p-2 text-left">Program Studi / Jurusan</th>
                <th className="border border-black p-2 text-left">Fakultas / Rumpun</th>
                <th className="border border-black p-2 text-left">Mata Pelajaran Pendukung</th>
                <th className="border border-black p-2 text-center w-24">Skor SAW (Vi)</th>
              </tr>
            </thead>
            <tbody>
              {topResults.map((res) => (
                <tr key={res.id}>
                  <td className="border border-black p-2 text-center font-black">
                    #{res.rank_position}
                  </td>
                  <td className="border border-black p-2 font-bold">
                    {res.program.name}
                  </td>
                  <td className="border border-black p-2 text-gray-700">
                    {res.program.faculty || "-"}
                  </td>
                  <td className="border border-black p-2 text-gray-700">
                    {res.program.criteria?.primary_subject?.name || "-"}
                    {res.program.criteria?.secondary_subject
                      ? `, ${res.program.criteria.secondary_subject.name}`
                      : ""}
                  </td>
                  <td className="border border-black p-2 text-center font-mono font-black">
                    {Number(res.preference_value).toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rekomendasi Karir & Prospek Kerja */}
        {topResults[0]?.program?.career_paths && topResults[0].program.career_paths.length > 0 && (
          <div className="border border-black p-3 mb-4 text-xs bg-gray-50">
            <h4 className="font-black uppercase mb-1">
              Prospek Karir untuk Rekomendasi Utama ({topResults[0].program.name}):
            </h4>
            <p className="text-gray-800">
              {topResults[0].program.career_paths.join(", ")}
            </p>
          </div>
        )}

        {/* ── CATATAN & ARAHAN GURU BK PADA CETAK PDF ── */}
        <div className="border border-black p-3.5 mb-8 text-xs bg-yellow-50/50">
          <h4 className="font-black uppercase mb-1 text-black">
            Catatan & Arahan Bimbingan Konseling (Guru BK):
          </h4>
          <p className="text-gray-900 italic leading-relaxed">
            {recommendation.counselor_notes
              ? `"${recommendation.counselor_notes}"`
              : "Siswa disarankan berdiskusi langsung dengan Guru BK untuk perencanaan pemilihan program studi SNBP/SNBT."}
          </p>
          {recommendation.counselor && (
            <p className="text-[10px] text-gray-600 font-bold mt-1 text-right">
              - Ditinjau oleh: {recommendation.counselor.name}
            </p>
          )}
        </div>

        {/* Tanda Tangan Pengesahan */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs mt-8 pt-2">
          <div>
            <p className="text-gray-600">Siswa yang bersangkutan,</p>
            <div className="h-16" />
            <p className="font-black underline">{student?.name}</p>
            <p className="text-gray-600 font-mono">NISN: {student?.nisn || "-"}</p>
          </div>

          <div>
            <p className="text-gray-600">
              Garut, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="text-gray-600">Guru Bimbingan Konseling (BK),</p>
            <div className="h-16" />
            <p className="font-black underline">
              {recommendation.counselor?.name || "Guru BK SMAN 18 Garut"}
            </p>
            <p className="text-gray-600">NIP. ........................................</p>
          </div>
        </div>
      </div>
    </>
  );
}
