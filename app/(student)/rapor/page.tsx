"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ChevronRight, Info, MoveHorizontal, Save } from "lucide-react";
import { api } from "@/lib/axios";
import type { StudentScore, Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";

interface SemesterScoreItem {
  sem1: string;
  sem2: string;
  sem3: string;
  sem4: string;
  sem5: string;
}

export default function RaporPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scores, setScores] = useState<Record<number, SemesterScoreItem>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, refreshMe } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        const [subjectsResponse, scoresResponse] = await Promise.all([
          api.get("/subjects"),
          api.get("/my-scores"),
        ]);
        const subList: Subject[] = subjectsResponse.data.data || [];
        setSubjects(subList);

        const initialMap: Record<number, SemesterScoreItem> = {};
        subList.forEach((sub) => {
          initialMap[sub.id] = { sem1: "", sem2: "", sem3: "", sem4: "", sem5: "" };
        });

        const savedScores: StudentScore[] = scoresResponse.data.data || [];
        savedScores.forEach((item) => {
          if (initialMap[item.subject_id]) {
            initialMap[item.subject_id] = {
              sem1: item.sem1 !== null && item.sem1 !== undefined ? String(item.sem1) : "",
              sem2: item.sem2 !== null && item.sem2 !== undefined ? String(item.sem2) : "",
              sem3: item.sem3 !== null && item.sem3 !== undefined ? String(item.sem3) : "",
              sem4: item.sem4 !== null && item.sem4 !== undefined ? String(item.sem4) : "",
              sem5: item.sem5 !== null && item.sem5 !== undefined ? String(item.sem5) : "",
            };
          }
        });

        setScores(initialMap);
      } catch (error: any) {
        toast({
          title: "Gagal memuat data nilai",
          description: error.appMessage || "Terjadi kesalahan.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [toast]);

  function handleSemesterChange(
    subjectId: number,
    field: "sem1" | "sem2" | "sem3" | "sem4" | "sem5",
    value: string
  ) {
    if (value !== "") {
      const num = Number(value);
      if (num < 0 || num > 100) return;
    }
    setScores((prev) => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] || { sem1: "", sem2: "", sem3: "", sem4: "", sem5: "" }),
        [field]: value,
      },
    }));
  }

  function getSubjectStats(subjectId: number) {
    const item = scores[subjectId];
    if (!item) return { sum: 0, avg: 0, count: 0, hasValue: false };

    const vals = [item.sem1, item.sem2, item.sem3, item.sem4, item.sem5]
      .filter((v) => v !== "" && v !== null && v !== undefined && !isNaN(Number(v)))
      .map((v) => Number(v));

    if (vals.length === 0) return { sum: 0, avg: 0, count: 0, hasValue: false };

    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = sum / vals.length;
    return { sum, avg, count: vals.length, hasValue: true };
  }

  const table1Subjects = useMemo(() => subjects.filter((s) => s.id <= 19), [subjects]);
  const table2Subjects = useMemo(() => subjects.filter((s) => s.id >= 20), [subjects]);

  const filledSubjectCount = useMemo(() => {
    return subjects.filter((s) => getSubjectStats(s.id).hasValue).length;
  }, [subjects, scores]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (filledSubjectCount === 0) {
      toast({
        title: "Perhatian",
        description: "Silakan isi nilai minimal untuk beberapa mata pelajaran pada semester 1-5.",
        type: "error",
      });
      return;
    }

    setSaving(true);

    try {
      const payload = subjects.map((sub) => {
        const item = scores[sub.id] || { sem1: "", sem2: "", sem3: "", sem4: "", sem5: "" };
        const stats = getSubjectStats(sub.id);
        return {
          subject_id: sub.id,
          sem1: item.sem1 !== "" ? Number(item.sem1) : null,
          sem2: item.sem2 !== "" ? Number(item.sem2) : null,
          sem3: item.sem3 !== "" ? Number(item.sem3) : null,
          sem4: item.sem4 !== "" ? Number(item.sem4) : null,
          sem5: item.sem5 !== "" ? Number(item.sem5) : null,
          score: stats.hasValue ? Number(stats.avg.toFixed(2)) : null,
        };
      });

      await api.post("/my-scores", { scores: payload });
      await refreshMe();
      toast({
        title: "Nilai Berhasil Disimpan",
        description: `Data nilai rapor (${filledSubjectCount} mata pelajaran) berhasil disimpan ke sistem.`,
        type: "success",
      });
    } catch (error: any) {
      toast({
        title: "Gagal menyimpan nilai",
        description: error.appMessage || "Terjadi kesalahan saat menyimpan data.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 max-w-5xl mx-auto px-1 sm:px-0">
      {/* ── KOP & PETUNJUK FORMAT ASLI ANGKET GURU BK ── */}
      <div className="border-4 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4 border-b-2 border-black">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-black leading-tight">
              NILAI MATA PELAJARAN
            </h1>
            <p className="text-[11px] sm:text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">
              SMAN 18 Garut • Kurikulum Merdeka
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1.5 w-full md:w-auto">
            <span className="text-xs sm:text-sm font-black italic text-gray-700">Lampiran</span>
            <div className="border-2 border-black p-2.5 sm:p-3 bg-yellow-50 w-full md:min-w-64 text-xs font-bold space-y-1">
              <div className="flex items-center justify-between gap-2 border-b border-black/30 pb-1">
                <span className="text-gray-600">Nama:</span>
                <strong className="text-black font-black font-mono truncate max-w-[180px] sm:max-w-[220px]">
                  {user?.name || "-"}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-600">Kls:</span>
                <strong className="text-black font-black font-mono">{user?.class || "-"}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Petunjuk */}
        <div className="pt-3 sm:pt-4 text-xs sm:text-sm text-gray-900">
          <p className="font-black text-black mb-1">Petunjuk:</p>
          <ol className="list-decimal list-inside space-y-1 font-medium">
            <li>Pindahkan angka nilai rapor untuk semua mata pelajaran pada tabel dibawah ini,</li>
            <li>
              Jumlahkan nilai semester 1 s.d 5 semua mata pelajaran, lalu dirata-ratakan (
              <span className="text-pink-700 font-black">dihitung otomatis secara instan oleh sistem</span>
              ).
            </li>
            <li>Mata pelajaran peminatan yang tidak diambil pada jurusan Anda boleh dikosongkan.</li>
          </ol>
        </div>
      </div>

      {/* ── TABEL UTAMA (No. 1 s/d 19) ── */}
      <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_#000] overflow-hidden">
        {/* Mobile Swipe Hint */}
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-yellow-300 border-b-2 border-black text-[11px] font-black text-black md:hidden">
          <span className="flex items-center gap-1">
            <MoveHorizontal className="h-3.5 w-3.5 shrink-0" /> Geser tabel ke samping untuk melihat semua semester
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
              {table1Subjects.map((sub, index) => {
                const stats = getSubjectStats(sub.id);
                const item = scores[sub.id] || { sem1: "", sem2: "", sem3: "", sem4: "", sem5: "" };
                const rowNo = index + 1;

                return (
                  <tr
                    key={sub.id}
                    className={`border-b border-black/30 transition-colors ${
                      stats.hasValue ? "bg-green-50/30" : "hover:bg-yellow-50/50"
                    }`}
                  >
                    <td className="border-r-2 border-black p-1.5 sm:p-2 text-center font-bold text-xs">
                      {rowNo}
                    </td>
                    <td className="border-r-2 border-black p-1.5 sm:p-2 font-bold text-black text-xs sm:text-sm">
                      {sub.name}
                    </td>

                    {/* I */}
                    <td className="border-r border-black p-0.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        placeholder=""
                        value={item.sem1}
                        onChange={(e) => handleSemesterChange(sub.id, "sem1", e.target.value)}
                        className="w-full text-center font-mono font-bold text-xs sm:text-sm p-1 sm:p-1.5 border border-black/40 bg-white focus:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </td>

                    {/* II */}
                    <td className="border-r border-black p-0.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        placeholder=""
                        value={item.sem2}
                        onChange={(e) => handleSemesterChange(sub.id, "sem2", e.target.value)}
                        className="w-full text-center font-mono font-bold text-xs sm:text-sm p-1 sm:p-1.5 border border-black/40 bg-white focus:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </td>

                    {/* III */}
                    <td className="border-r border-black p-0.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        placeholder=""
                        value={item.sem3}
                        onChange={(e) => handleSemesterChange(sub.id, "sem3", e.target.value)}
                        className="w-full text-center font-mono font-bold text-xs sm:text-sm p-1 sm:p-1.5 border border-black/40 bg-white focus:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </td>

                    {/* IV */}
                    <td className="border-r border-black p-0.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        placeholder=""
                        value={item.sem4}
                        onChange={(e) => handleSemesterChange(sub.id, "sem4", e.target.value)}
                        className="w-full text-center font-mono font-bold text-xs sm:text-sm p-1 sm:p-1.5 border border-black/40 bg-white focus:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </td>

                    {/* V */}
                    <td className="border-r-2 border-black p-0.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        placeholder=""
                        value={item.sem5}
                        onChange={(e) => handleSemesterChange(sub.id, "sem5", e.target.value)}
                        className="w-full text-center font-mono font-bold text-xs sm:text-sm p-1 sm:p-1.5 border border-black/40 bg-white focus:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </td>

                    {/* Σ (Jumlah) */}
                    <td className="border-r-2 border-black p-1.5 sm:p-2 text-center font-mono font-bold text-xs bg-yellow-50/60">
                      {stats.hasValue ? stats.sum.toFixed(0) : ""}
                    </td>

                    {/* Re-rata */}
                    <td className="p-1.5 sm:p-2 text-center font-mono font-black text-xs sm:text-sm bg-green-50/60 text-green-950">
                      {stats.hasValue ? stats.avg.toFixed(1) : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TABEL BAWAH (IPA & IPS) ── */}
      {table2Subjects.length > 0 && (
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
                {table2Subjects.map((sub, index) => {
                  const stats = getSubjectStats(sub.id);
                  const item = scores[sub.id] || { sem1: "", sem2: "", sem3: "", sem4: "", sem5: "" };
                  const rowNo = index + 1;

                  return (
                    <tr
                      key={sub.id}
                      className={`border-b border-black/30 transition-colors ${
                        stats.hasValue ? "bg-green-50/30" : "hover:bg-yellow-50/50"
                      }`}
                    >
                      <td className="border-r-2 border-black p-1.5 sm:p-2 text-center font-bold text-xs">
                        {rowNo}
                      </td>
                      <td className="border-r-2 border-black p-1.5 sm:p-2 font-bold text-black text-xs sm:text-sm">
                        {sub.name}
                      </td>

                      {/* I */}
                      <td className="border-r border-black p-0.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="any"
                          placeholder=""
                          value={item.sem1}
                          onChange={(e) => handleSemesterChange(sub.id, "sem1", e.target.value)}
                          className="w-full text-center font-mono font-bold text-xs sm:text-sm p-1 sm:p-1.5 border border-black/40 bg-white focus:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </td>

                      {/* II */}
                      <td className="border-r border-black p-0.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="any"
                          placeholder=""
                          value={item.sem2}
                          onChange={(e) => handleSemesterChange(sub.id, "sem2", e.target.value)}
                          className="w-full text-center font-mono font-bold text-xs sm:text-sm p-1 sm:p-1.5 border border-black/40 bg-white focus:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </td>

                      {/* III */}
                      <td className="border-r border-black p-0.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="any"
                          placeholder=""
                          value={item.sem3}
                          onChange={(e) => handleSemesterChange(sub.id, "sem3", e.target.value)}
                          className="w-full text-center font-mono font-bold text-xs sm:text-sm p-1 sm:p-1.5 border border-black/40 bg-white focus:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </td>

                      {/* IV */}
                      <td className="border-r border-black p-0.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="any"
                          placeholder=""
                          value={item.sem4}
                          onChange={(e) => handleSemesterChange(sub.id, "sem4", e.target.value)}
                          className="w-full text-center font-mono font-bold text-xs sm:text-sm p-1 sm:p-1.5 border border-black/40 bg-white focus:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </td>

                      {/* V */}
                      <td className="border-r-2 border-black p-0.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="any"
                          placeholder=""
                          value={item.sem5}
                          onChange={(e) => handleSemesterChange(sub.id, "sem5", e.target.value)}
                          className="w-full text-center font-mono font-bold text-xs sm:text-sm p-1 sm:p-1.5 border border-black/40 bg-white focus:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </td>

                      {/* Σ (Jumlah) */}
                      <td className="border-r-2 border-black p-1.5 sm:p-2 text-center font-mono font-bold text-xs bg-yellow-50/60">
                        {stats.hasValue ? stats.sum.toFixed(0) : ""}
                      </td>

                      {/* Re-rata */}
                      <td className="p-1.5 sm:p-2 text-center font-mono font-black text-xs sm:text-sm bg-green-50/60 text-green-950">
                        {stats.hasValue ? stats.avg.toFixed(1) : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating / Bottom Save Bar */}
      <div className="sticky bottom-2 sm:bottom-4 z-20 nb-card bg-white p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-4 border-black shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 sm:h-10 sm:w-10 bg-yellow-400 border-2 border-black flex items-center justify-center font-black shrink-0 text-sm sm:text-base">
            {filledSubjectCount}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-black text-black">
              {filledSubjectCount} dari {subjects.length} Mata Pelajaran Terisi
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 font-bold">
              Re-rata setiap mata pelajaran dihitung otomatis untuk rekomendasi karir SAW.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving || filledSubjectCount === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-black uppercase"
          id="btn-simpan-rapor"
        >
          <Save className="h-4 w-4" />
          {saving ? "Menyimpan..." : "Simpan Angket Nilai"}
        </Button>
      </div>
    </form>
  );
}
