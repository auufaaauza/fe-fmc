"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink, Medal } from "lucide-react";
import type { RecommendationResult } from "@/types";
import { Button } from "@/components/ui/button";
import { ScoreBreakdown } from "@/components/recommendation/ScoreBreakdown";
import { cn } from "@/lib/utils";

interface RankCardProps {
  result: RecommendationResult;
}

const rankStyles: Record<number, string> = {
  1: "border-amber-200 bg-gradient-to-br from-amber-50 to-white",
  2: "border-slate-200 bg-gradient-to-br from-slate-50 to-white",
  3: "border-orange-200 bg-gradient-to-br from-orange-50 to-white",
};

const rankBadgeStyles: Record<number, string> = {
  1: "bg-amber-400 text-amber-900",
  2: "bg-slate-300 text-slate-800",
  3: "bg-orange-300 text-orange-900",
};

export function RankCard({ result }: RankCardProps) {
  const [open, setOpen] = useState(false);
  const score = Number(result.preference_value);
  const percent = Math.min(100, Math.round(score * 100));

  const cardClass = rankStyles[result.rank_position] ?? "border-slate-200 bg-white";
  const badgeClass = rankBadgeStyles[result.rank_position] ?? "bg-indigo-100 text-indigo-700";

  return (
    <article className={cn("rounded-xl border p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md", cardClass)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Rank Badge */}
          <div className={cn(
            "flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl text-lg sm:text-2xl font-bold shadow-sm",
            badgeClass
          )}>
            #{result.rank_position}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {result.rank_position <= 3 && (
                <Medal className="h-4 w-4 text-amber-500 shrink-0" />
              )}
              <h2 className="text-base sm:text-xl font-semibold text-slate-900 leading-tight">
                {result.program.name}
              </h2>
            </div>
            {result.program.faculty && (
              <span className="mt-1.5 inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                {result.program.faculty}
              </span>
            )}
            <div className="mt-2 text-xs sm:text-sm text-slate-600">
              Nilai Preferensi:{" "}
              <span className="font-mono font-semibold text-indigo-600">{score.toFixed(4)}</span>
            </div>
          </div>
        </div>

        <Button
          asChild
          variant="glass"
          size="sm"
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5"
        >
          <Link href={`/hasil/${result.program.id}`}>
            Lihat Detail <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-right text-[10px] text-slate-400">{percent}%</p>

      {/* Accordion SAW Breakdown */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
        <span>{open ? "Tutup Rincian Perhitungan" : "Lihat Rincian Perhitungan SAW"}</span>
      </button>

      {open && (
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-100">
          <ScoreBreakdown result={result} />
        </div>
      )}
    </article>
  );
}
