"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { api } from "@/lib/axios";
import type { InterestCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";

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
    () => categories.flatMap((category) => category.questions),
    [categories]
  );

  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.get("/questionnaire");
        setCategories(response.data.data);
        setAnswers(response.data.answers ?? {});
      } catch (error: any) {
        toast({
          title: "Gagal memuat kuesioner",
          description: error.appMessage,
          type: "error",
        });
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
        answers: totalQuestions.map((question) => ({
          question_id: question.id,
          answer_score: answers[question.id],
        })),
      });
      await refreshMe();
      toast({
        title: "Berhasil",
        description: "Jawaban kuesioner berhasil disimpan.",
        type: "success",
      });
    } catch (error: any) {
      toast({
        title: "Gagal menyimpan kuesioner",
        description: error.appMessage,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kuesioner Minat Karir RIASEC"
        description="Pilihlah skala 1 (Sangat Tidak Setuju) hingga 5 (Sangat Setuju) sesuai minat dan kepribadian Anda."
      />

      {/* Progress Bar */}
      <div className="border-2 border-black bg-white p-1 shadow-[2px_2px_0px_0px_#000]">
        <div
          className="h-3 bg-pink-400 transition-all duration-300"
          style={{ width: `${((page + 1) / categories.length) * 100}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="nb-badge bg-yellow-300 text-xs sm:text-sm">
          Kategori: {current?.name}
        </span>
        <span className="text-xs sm:text-sm font-black text-gray-700">
          Halaman {page + 1} dari {categories.length}
        </span>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {current?.questions.map((question) => (
          <article key={question.id} className="nb-card p-4 sm:p-5 bg-white">
            <h2 className="mb-3 text-base sm:text-lg font-black text-black leading-snug">
              {question.question}
            </h2>

            {/* 1-5 Rating buttons with responsive padding */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
              {[1, 2, 3, 4, 5].map((value) => {
                const isSelected = answers[question.id] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setAnswers((currentAnswers) => ({
                        ...currentAnswers,
                        [question.id]: value,
                      }))
                    }
                    className={`border-2 border-black py-2.5 sm:py-3.5 text-sm sm:text-base font-black transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                      isSelected
                        ? "bg-yellow-400 scale-[1.02]"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 flex justify-between text-[11px] sm:text-xs font-bold text-gray-600">
              <span>1 = Sangat Tidak Suka</span>
              <span>5 = Sangat Suka</span>
            </div>
          </article>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-3 pt-2">
        <Button
          variant="plain"
          type="button"
          disabled={page === 0}
          onClick={() => setPage((value) => value - 1)}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Prev
        </Button>

        {page === categories.length - 1 ? (
          <Button
            type="button"
            disabled={saving}
            onClick={saveAll}
            className="flex items-center gap-1.5 bg-green-400 hover:bg-green-500 text-black"
          >
            <Check className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Selesai & Simpan"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => setPage((value) => value + 1)}
            className="flex items-center gap-1.5"
          >
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
