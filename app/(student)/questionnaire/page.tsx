"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { api } from "@/lib/axios";
import type { InterestCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";

const likertScales = [
  { value: 1, short: "STS", label: "Sangat Tidak Suka" },
  { value: 2, short: "TS", label: "Tidak Suka" },
  { value: 3, short: "N", label: "Netral" },
  { value: 4, short: "S", label: "Suka" },
  { value: 5, short: "SS", label: "Sangat Suka" },
];

export default function QuestionnairePage() {
  const [categories, setCategories] = useState<InterestCategory[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { refreshMe } = useAuth();
  const { toast } = useToast();

  const current = categories[page];
  const totalQuestions = useMemo(
    () => categories.flatMap((c) => c.questions),
    [categories]
  );

  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.get("/questionnaire");
        setCategories(response.data.data);
        setAnswers(response.data.answers ?? {});
      } catch (error: any) {
        toast({ title: "Gagal memuat kuesioner", description: error.appMessage, type: "error" });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [toast]);

  async function saveAll() {
    setSaving(true);
    try {
      await api.post("/questionnaire/answers", {
        answers: totalQuestions.map((q) => ({
          question_id: q.id,
          answer_score: answers[q.id],
        })),
      });
      await refreshMe();
      toast({ title: "Berhasil", description: "Jawaban kuesioner berhasil disimpan.", type: "success" });
    } catch (error: any) {
      toast({ title: "Gagal menyimpan", description: error.appMessage, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  const progressPct = categories.length > 0 ? ((page + 1) / categories.length) * 100 : 0;
  const currentAnsweredCount = (current?.questions ?? []).filter((q) => answers[q.id] !== undefined).length;
  const totalInCurrent = current?.questions?.length ?? 0;

  return (
    <div className="space-y-3 max-w-5xl mx-auto">
      {/* ── Compact Header & Progress Bar ── */}
      <div className="nb-card p-3 sm:p-4 bg-white border border-slate-200 shadow-sm rounded-xl">
        <div className="flex items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
              <Sparkles className="h-3 w-3" /> RIASEC
            </span>
            <h1 className="text-xs sm:text-sm font-semibold text-slate-800">
              Dimensi: <span className="text-indigo-600 font-bold">{current?.name}</span>
            </h1>
          </div>

          <div className="text-right text-xs">
            <span className="font-semibold text-slate-700">
              {page + 1}/{categories.length}
            </span>
            <span className="text-slate-400 ml-1.5 text-[11px]">
              ({currentAnsweredCount}/{totalInCurrent} Terisi)
            </span>
          </div>
        </div>

        {/* Slim Progress Bar */}
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Seamless Likert List (No Box Borders) ── */}
      <div className="nb-card bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="py-2.5 px-3 text-center w-10 font-semibold">No</th>
                <th className="py-2.5 px-3 text-left font-semibold">Pernyataan Aktivitas / Karir</th>
                {likertScales.map((scale) => (
                  <th key={scale.value} className="py-2.5 px-2 text-center w-16 font-semibold">
                    <div className="text-xs font-bold text-slate-700">{scale.value}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{scale.short}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {current?.questions.map((question, qi) => {
                const selectedVal = answers[question.id];
                return (
                  <tr
                    key={question.id}
                    className={`border-b border-slate-100 transition-colors ${
                      selectedVal !== undefined ? "bg-indigo-50/15" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-xs">
                      {qi + 1}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800 text-xs leading-snug">
                      {question.question}
                    </td>

                    {likertScales.map((scale) => {
                      const isChecked = selectedVal === scale.value;
                      return (
                        <td
                          key={scale.value}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [question.id]: scale.value }))
                          }
                          className="py-2 px-2 text-center cursor-pointer hover:bg-indigo-50/30 transition-colors"
                        >
                          <div className="flex items-center justify-center">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={scale.value}
                              checked={isChecked}
                              onChange={() =>
                                setAnswers((prev) => ({ ...prev, [question.id]: scale.value }))
                              }
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer accent-indigo-600"
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Borderless Ultra-Compact Likert Radio Row */}
        <div className="md:hidden divide-y divide-slate-100">
          {current?.questions.map((question, qi) => {
            const selectedVal = answers[question.id];
            return (
              <div
                key={question.id}
                className={`px-3 py-2 transition-colors ${
                  selectedVal !== undefined ? "bg-indigo-50/15" : ""
                }`}
              >
                <div className="flex items-start gap-1.5 mb-1.5">
                  <span className="font-bold text-indigo-600 text-xs shrink-0">
                    {qi + 1}.
                  </span>
                  <p className="text-xs font-medium text-slate-800 leading-snug">
                    {question.question}
                  </p>
                </div>

                {/* Borderless Radio Dots Row */}
                <div className="flex items-center justify-between px-2 pt-0.5">
                  {likertScales.map((scale) => {
                    const isChecked = selectedVal === scale.value;
                    return (
                      <label
                        key={scale.value}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [question.id]: scale.value }))
                        }
                        className="flex flex-col items-center justify-center cursor-pointer py-1 px-2 group"
                      >
                        <input
                          type="radio"
                          name={`mobile-question-${question.id}`}
                          value={scale.value}
                          checked={isChecked}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [question.id]: scale.value }))
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer accent-indigo-600"
                        />
                        <span className={`text-[11px] font-bold mt-0.5 leading-none ${isChecked ? "text-indigo-600" : "text-slate-600"}`}>
                          {scale.value}
                        </span>
                        <span className={`text-[9px] mt-0.5 ${isChecked ? "text-indigo-600 font-semibold" : "text-slate-400"}`}>
                          {scale.short}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scale Legend (STS, TS, N, S, SS) */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[10px] sm:text-[11px] text-slate-500">
        <span><strong>1 STS</strong> = Sangat Tidak Suka</span>
        <span><strong>2 TS</strong> = Tidak Suka</span>
        <span><strong>3 N</strong> = Netral</span>
        <span><strong>4 S</strong> = Suka</span>
        <span><strong>5 SS</strong> = Sangat Suka</span>
      </div>

      {/* ── Navigation Buttons ── */}
      <div className="flex items-center justify-between gap-3 pt-0.5">
        <Button
          variant="plain"
          type="button"
          disabled={page === 0}
          onClick={() => setPage((v) => v - 1)}
          className="flex items-center gap-1.5 text-xs px-3.5 py-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Sebelumnya
        </Button>

        {page === categories.length - 1 ? (
          <Button
            type="button"
            disabled={saving}
            onClick={saveAll}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2"
          >
            <Check className="h-3.5 w-3.5" />
            {saving ? "Menyimpan..." : "Selesai & Simpan"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => setPage((v) => v + 1)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2"
          >
            Kategori Berikutnya <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
