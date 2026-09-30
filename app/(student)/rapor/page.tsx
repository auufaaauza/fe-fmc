"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Info, MoveHorizontal, Save } from "lucide-react";
import { api } from "@/lib/axios";
import type { StudentScore, Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useFloatingBarVisibility } from "@/hooks/useFloatingBarVisibility";

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
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "offline">("idle");
  const { user, refreshMe } = useAuth();
  const { toast } = useToast();
  const showFloatingBar = useFloatingBarVisibility();

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

        const draftKey = `fmc-rapor-draft-${user?.id ?? "current"}`;
        const draft = typeof window !== "undefined" ? localStorage.getItem(draftKey) : null;
        setScores(draft ? { ...initialMap, ...JSON.parse(draft) } : initialMap);
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
    const handleOnline = () => {
      const draftKey = `fmc-rapor-draft-${user?.id ?? "current"}`;
      const draft = typeof window !== "undefined" ? localStorage.getItem(draftKey) : null;
      if (draft) {
        try { persistDraft(JSON.parse(draft)); } catch { /* draft akan tetap tersimpan */ }
      }
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [toast, user?.id]);

  async function persistDraft(nextScores: Record<number, SemesterScoreItem>, subjectList = subjects) {
    const draftKey = `fmc-rapor-draft-${user?.id ?? "current"}`;
    if (typeof window !== "undefined") localStorage.setItem(draftKey, JSON.stringify(nextScores));
    setSaveStatus("saving");
    try {
      const payload = subjectList.map((sub) => {
        const item = nextScores[sub.id] || { sem1: "", sem2: "", sem3: "", sem4: "", sem5: "" };
        const vals = [item.sem1, item.sem2, item.sem3, item.sem4, item.sem5].filter((v) => v !== "").map(Number);
        const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        return { subject_id: sub.id, sem1: item.sem1 !== "" ? Number(item.sem1) : null, sem2: item.sem2 !== "" ? Number(item.sem2) : null, sem3: item.sem3 !== "" ? Number(item.sem3) : null, sem4: item.sem4 !== "" ? Number(item.sem4) : null, sem5: item.sem5 !== "" ? Number(item.sem5) : null, score: avg === null ? null : Number(avg.toFixed(2)) };
      });
      await api.post("/my-scores", { scores: payload });
      if (typeof window !== "undefined") localStorage.removeItem(draftKey);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("offline");
    }
  }

  function handleSemesterChange(
    subjectId: number,
    field: "sem1" | "sem2" | "sem3" | "sem4" | "sem5",
    value: string
  ) {
    if (value !== "") {
      const num = Number(value);
      if (num < 0 || num > 100) return;
    }
    setScores((prev) => {
      const next = {
        ...prev,
      [subjectId]: {
        ...(prev[subjectId] || { sem1: "", sem2: "", sem3: "", sem4: "", sem5: "" }),
        [field]: value,
      },
      };
      window.setTimeout(() => persistDraft(next), 700);
      return next;
    });
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
      if (typeof window !== "undefined") localStorage.removeItem(`fmc-rapor-draft-${user?.id ?? "current"}`);
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

  const renderMobileSubjectCards = (subjectList: Subject[]) => (
    <div className="space-y-3 p-3 md:hidden">
      {subjectList.map((subject, index) => {
        const item = scores[subject.id] || { sem1: "", sem2: "", sem3: "", sem4: "", sem5: "" };
        const stats = getSubjectStats(subject.id);
        const fields = ["sem1", "sem2", "sem3", "sem4", "sem5"] as const;
        return (
          <section key={subject.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold leading-snug text-slate-800">{index + 1}. {subject.name}</h4>
              <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                {stats.hasValue ? `Rerata ${stats.avg.toFixed(1)}` : "Belum diisi"}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {fields.map((field, fieldIndex) => (
                <label key={field} className="min-w-0 text-center">
                  <span className="mb-1 block text-[10px] font-medium text-slate-500">Sem. {fieldIndex + 1}</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    inputMode="decimal"
                    placeholder="-"
                    aria-label={`${subject.name}, semester ${fieldIndex + 1}`}
                    value={item[field]}
                    onChange={(event) => handleSemesterChange(subject.id, field, event.target.value)}
                    className="w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-1 py-2 text-center text-sm font-medium focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 max-w-5xl mx-auto pb-28 sm:pb-32">
      {/* ── KOP & PETUNJUK FORMAT ANGKET BK ── */}
      <div className="nb-card p-4 sm:p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 mb-1.5">
              Lampiran Angket Nilai Siswa
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Input Nilai Rapor Semester 1–5
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              SMAN 18 Garut • Kurikulum Merdeka
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1 w-full md:w-auto">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 w-full md:min-w-60 text-xs space-y-1">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-1">
                <span className="text-slate-500">Nama:</span>
                <strong className="text-slate-900 font-mono truncate max-w-[180px]">
                  {user?.name || "-"}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">Kelas:</span>
                <strong className="text-slate-900 font-mono">{user?.class || "-"}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3.5 text-xs text-slate-600">
          <p className="font-semibold text-slate-800 mb-1">Petunjuk Pengisian:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-500">
            <li>Isi angka nilai rapor untuk semua mata pelajaran dari semester 1 s.d 5 (skala 0–100).</li>
            <li>Jumlah dan Rerata tiap mata pelajaran akan dihitung secara otomatis oleh sistem.</li>
            <li>Mata pelajaran peminatan yang tidak Anda ambil boleh dikosongkan.</li>
          </ol>
        </div>
      </div>

      {/* ── TABEL UTAMA (Mata Pelajaran Umum 1 s/d 19) ── */}
      <div className="nb-card bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Mata Pelajaran Umum & Wajib
            </h3>
            <span className="text-xs text-slate-500">
              ({table1Subjects.length} Mata Pelajaran)
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 md:hidden">
            <MoveHorizontal className="h-3.5 w-3.5" /> Geser tabel
          </div>
        </div>

        {renderMobileSubjectCards(table1Subjects)}
        <div className="rapor-table-scroll hidden overflow-x-auto pb-1 md:block">
          <table className="w-full text-xs sm:text-sm border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600">
                <th rowSpan={2} className="border-r border-slate-200 p-2.5 text-center w-10 sm:w-12 font-semibold text-xs">
                  No
                </th>
                <th rowSpan={2} className="border-r border-slate-200 p-2.5 text-left min-w-[160px] sm:min-w-[200px] font-semibold text-xs">
                  Mata Pelajaran
                </th>
                <th colSpan={5} className="border-r border-slate-200 p-1.5 text-center font-semibold text-xs bg-indigo-50/40 text-indigo-900">
                  Nilai Semester
                </th>
                <th rowSpan={2} className="border-r border-slate-200 p-2 text-center w-16 sm:w-20 font-semibold text-xs bg-amber-50/50 text-amber-900">
                  Jumlah
                </th>
                <th rowSpan={2} className="p-2 text-center w-20 sm:w-24 font-semibold text-xs bg-emerald-50/50 text-emerald-900">
                  Rerata
                </th>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] text-slate-500">
                <th className="border-r border-slate-200 p-1 text-center w-12 sm:w-14 font-medium">I</th>
                <th className="border-r border-slate-200 p-1 text-center w-12 sm:w-14 font-medium">II</th>
                <th className="border-r border-slate-200 p-1 text-center w-12 sm:w-14 font-medium">III</th>
                <th className="border-r border-slate-200 p-1 text-center w-12 sm:w-14 font-medium">IV</th>
                <th className="border-r border-slate-200 p-1 text-center w-12 sm:w-14 font-medium">V</th>
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
                    className={`border-b border-slate-100 transition-colors ${
                      stats.hasValue ? "bg-indigo-50/15 hover:bg-indigo-50/30" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <td className="border-r border-slate-200 p-2 text-center text-slate-500 font-mono text-xs">
                      {rowNo}
                    </td>
                    <td className="border-r border-slate-200 p-2 font-medium text-slate-800 text-xs sm:text-sm">
                      {sub.name}
                    </td>

                    {/* I */}
                    <td className="border-r border-slate-200 p-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        placeholder="-"
                        value={item.sem1}
                        onChange={(e) => handleSemesterChange(sub.id, "sem1", e.target.value)}
                        className="w-full text-center font-mono font-medium text-xs sm:text-sm py-1.5 px-1 rounded-md border border-slate-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-indigo-50/20 focus:outline-none transition-all placeholder:text-slate-300"
                      />
                    </td>

                    {/* II */}
                    <td className="border-r border-slate-200 p-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        placeholder="-"
                        value={item.sem2}
                        onChange={(e) => handleSemesterChange(sub.id, "sem2", e.target.value)}
                        className="w-full text-center font-mono font-medium text-xs sm:text-sm py-1.5 px-1 rounded-md border border-slate-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-indigo-50/20 focus:outline-none transition-all placeholder:text-slate-300"
                      />
                    </td>

                    {/* III */}
                    <td className="border-r border-slate-200 p-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        placeholder="-"
                        value={item.sem3}
                        onChange={(e) => handleSemesterChange(sub.id, "sem3", e.target.value)}
                        className="w-full text-center font-mono font-medium text-xs sm:text-sm py-1.5 px-1 rounded-md border border-slate-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-indigo-50/20 focus:outline-none transition-all placeholder:text-slate-300"
                      />
                    </td>

                    {/* IV */}
                    <td className="border-r border-slate-200 p-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        placeholder="-"
                        value={item.sem4}
                        onChange={(e) => handleSemesterChange(sub.id, "sem4", e.target.value)}
                        className="w-full text-center font-mono font-medium text-xs sm:text-sm py-1.5 px-1 rounded-md border border-slate-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-indigo-50/20 focus:outline-none transition-all placeholder:text-slate-300"
                      />
                    </td>

                    {/* V */}
                    <td className="border-r border-slate-200 p-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        placeholder="-"
                        value={item.sem5}
                        onChange={(e) => handleSemesterChange(sub.id, "sem5", e.target.value)}
                        className="w-full text-center font-mono font-medium text-xs sm:text-sm py-1.5 px-1 rounded-md border border-slate-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-indigo-50/20 focus:outline-none transition-all placeholder:text-slate-300"
                      />
                    </td>

                    {/* Jumlah */}
                    <td className="border-r border-slate-200 p-1.5 sm:p-2 text-center font-mono font-semibold text-xs text-amber-900 bg-amber-50/40">
                      {stats.hasValue ? stats.sum.toFixed(0) : <span className="text-slate-300">-</span>}
                    </td>

                    {/* Re-rata */}
                    <td className="p-1.5 sm:p-2 text-center font-mono font-bold text-xs sm:text-sm text-emerald-700 bg-emerald-50/40">
                      {stats.hasValue ? stats.avg.toFixed(1) : <span className="text-slate-300">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TABEL PILIHAN / PEMINATAN (IPA & IPS No. 20 s/d 30+) ── */}
      {table2Subjects.length > 0 && (
        <div className="nb-card bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800">
                Mata Pelajaran Pilihan & Pendukung Rumpun (IPA / IPS / Bahasa)
              </h3>
              <span className="text-xs text-slate-500">
                ({table2Subjects.length} Mata Pelajaran)
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 md:hidden">
              <MoveHorizontal className="h-3.5 w-3.5" /> Geser tabel
            </div>
          </div>

          {renderMobileSubjectCards(table2Subjects)}
          <div className="rapor-table-scroll hidden overflow-x-auto pb-1 md:block">
            <table className="w-full text-xs sm:text-sm border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600">
                  <th rowSpan={2} className="border-r border-slate-200 p-2.5 text-center w-10 sm:w-12 font-semibold text-xs">
                    No
                  </th>
                  <th rowSpan={2} className="border-r border-slate-200 p-2.5 text-left min-w-[160px] sm:min-w-[200px] font-semibold text-xs">
                    Mata Pelajaran
                  </th>
                  <th colSpan={5} className="border-r border-slate-200 p-1.5 text-center font-semibold text-xs bg-indigo-50/40 text-indigo-900">
                    Nilai Semester
                  </th>
                  <th rowSpan={2} className="border-r border-slate-200 p-2 text-center w-16 sm:w-20 font-semibold text-xs bg-amber-50/50 text-amber-900">
                    Jumlah
                  </th>
                  <th rowSpan={2} className="p-2 text-center w-20 sm:w-24 font-semibold text-xs bg-emerald-50/50 text-emerald-900">
                    Rerata
                  </th>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] text-slate-500">
                  <th className="border-r border-slate-200 p-1 text-center w-12 sm:w-14 font-medium">I</th>
                  <th className="border-r border-slate-200 p-1 text-center w-12 sm:w-14 font-medium">II</th>
                  <th className="border-r border-slate-200 p-1 text-center w-12 sm:w-14 font-medium">III</th>
                  <th className="border-r border-slate-200 p-1 text-center w-12 sm:w-14 font-medium">IV</th>
                  <th className="border-r border-slate-200 p-1 text-center w-12 sm:w-14 font-medium">V</th>
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
                      className={`border-b border-slate-100 transition-colors ${
                        stats.hasValue ? "bg-indigo-50/15 hover:bg-indigo-50/30" : "hover:bg-slate-50/60"
                      }`}
                    >
                      <td className="border-r border-slate-200 p-2 text-center text-slate-500 font-mono text-xs">
                        {rowNo}
                      </td>
                      <td className="border-r border-slate-200 p-2 font-medium text-slate-800 text-xs sm:text-sm">
                        {sub.name}
                      </td>

                      {/* I */}
                      <td className="border-r border-slate-200 p-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="any"
                          placeholder="-"
                          value={item.sem1}
                          onChange={(e) => handleSemesterChange(sub.id, "sem1", e.target.value)}
                          className="w-full text-center font-mono font-medium text-xs sm:text-sm py-1.5 px-1 rounded-md border border-slate-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-indigo-50/20 focus:outline-none transition-all placeholder:text-slate-300"
                        />
                      </td>

                      {/* II */}
                      <td className="border-r border-slate-200 p-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="any"
                          placeholder="-"
                          value={item.sem2}
                          onChange={(e) => handleSemesterChange(sub.id, "sem2", e.target.value)}
                          className="w-full text-center font-mono font-medium text-xs sm:text-sm py-1.5 px-1 rounded-md border border-slate-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-indigo-50/20 focus:outline-none transition-all placeholder:text-slate-300"
                        />
                      </td>

                      {/* III */}
                      <td className="border-r border-slate-200 p-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="any"
                          placeholder="-"
                          value={item.sem3}
                          onChange={(e) => handleSemesterChange(sub.id, "sem3", e.target.value)}
                          className="w-full text-center font-mono font-medium text-xs sm:text-sm py-1.5 px-1 rounded-md border border-slate-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-indigo-50/20 focus:outline-none transition-all placeholder:text-slate-300"
                        />
                      </td>

                      {/* IV */}
                      <td className="border-r border-slate-200 p-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="any"
                          placeholder="-"
                          value={item.sem4}
                          onChange={(e) => handleSemesterChange(sub.id, "sem4", e.target.value)}
                          className="w-full text-center font-mono font-medium text-xs sm:text-sm py-1.5 px-1 rounded-md border border-slate-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-indigo-50/20 focus:outline-none transition-all placeholder:text-slate-300"
                        />
                      </td>

                      {/* V */}
                      <td className="border-r border-slate-200 p-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="any"
                          placeholder="-"
                          value={item.sem5}
                          onChange={(e) => handleSemesterChange(sub.id, "sem5", e.target.value)}
                          className="w-full text-center font-mono font-medium text-xs sm:text-sm py-1.5 px-1 rounded-md border border-slate-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-indigo-50/20 focus:outline-none transition-all placeholder:text-slate-300"
                        />
                      </td>

                      {/* Jumlah */}
                      <td className="border-r border-slate-200 p-1.5 sm:p-2 text-center font-mono font-semibold text-xs text-amber-900 bg-amber-50/40">
                        {stats.hasValue ? stats.sum.toFixed(0) : <span className="text-slate-300">-</span>}
                      </td>

                      {/* Re-rata */}
                      <td className="p-1.5 sm:p-2 text-center font-mono font-bold text-xs sm:text-sm text-emerald-700 bg-emerald-50/40">
                        {stats.hasValue ? stats.avg.toFixed(1) : <span className="text-slate-300">-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── STICKY BOTTOM SAVE BAR (Auto-hide on scroll down) ── */}
      <div
        className={`fixed bottom-4 left-4 right-4 md:left-72 md:right-8 z-30 flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-lg transition-all duration-300 ease-in-out ${
          showFloatingBar
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-24 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3">
          <p className={`text-[11px] hidden sm:block ${saveStatus === "offline" ? "text-amber-600" : "text-slate-400"}`}>
            {saveStatus === "saving" ? "Menyimpan otomatis..." : saveStatus === "saved" ? "Tersimpan" : saveStatus === "offline" ? "Offline: draft tersimpan di perangkat" : ""}
          </p>
          <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 shrink-0 text-sm">
            {filledSubjectCount}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-900">
              {filledSubjectCount} dari {subjects.length} Mapel Terisi
            </p>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Rerata nilai otomatis dihitung untuk kalkulasi rekomendasi karir SAW.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving || filledSubjectCount === 0}
          className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm"
          id="btn-simpan-rapor"
        >
          <Save className="h-4 w-4" />
          {saving ? "Menyimpan..." : "Simpan Nilai Rapor"}
        </Button>
      </div>
    </form>
  );
}
