"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink, Medal } from "lucide-react";
import type { RecommendationResult } from "@/types";
import { Button } from "@/components/ui/button";
import { ScoreBreakdown } from "@/components/recommendation/ScoreBreakdown";

interface RankCardProps {
  result: RecommendationResult;
}

export function RankCard({ result }: RankCardProps) {
  const [open, setOpen] = useState(false);
  const score = Number(result.preference_value);
  const percent = Math.min(100, Math.round(score * 100));
  const rankClass =
    result.rank_position === 1
      ? "bg-yellow-300"
      : result.rank_position === 2
        ? "bg-zinc-100"
        : result.rank_position === 3
          ? "bg-orange-200"
          : "bg-white";

  return (
    <article className={`nb-card p-4 sm:p-6 ${rankClass}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Rank Badge */}
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center border-2 border-black bg-white text-xl sm:text-3xl font-black shadow-[2px_2px_0px_0px_#000]">
            #{result.rank_position}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {result.rank_position <= 3 ? (
                <Medal className="h-5 w-5 text-amber-600 shrink-0" />
              ) : null}
              <h2 className="text-lg sm:text-2xl font-black text-black leading-tight">
                {result.program.name}
              </h2>
            </div>
            {result.program.faculty && (
              <span className="nb-badge-pink mt-1.5 inline-block text-[11px]">
                {result.program.faculty}
              </span>
            )}
            <div className="mt-2 font-mono text-sm sm:text-base font-black text-black">
              Nilai Preferensi: <span className="text-pink-700">{score.toFixed(4)}</span>
            </div>
          </div>
        </div>

        <Button asChild className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 text-xs sm:text-sm">
          <Link href={`/hasil/${result.program.id}`}>
            Lihat Detail <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-4 sm:h-5 border-2 border-black bg-white shadow-[1px_1px_0px_0px_#000]">
        <div
          className="h-full bg-pink-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Accordion toggle for SAW breakdown */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-4 flex w-full sm:w-auto items-center justify-center sm:justify-start gap-2 border-2 border-black bg-white px-3 py-2 text-xs sm:text-sm font-black transition-colors hover:bg-yellow-100 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
        <span>{open ? "Tutup Rincian Perhitungan" : "Lihat Rincian Perhitungan SAW"}</span>
      </button>

      {open ? (
        <div className="mt-4 overflow-x-auto">
          <ScoreBreakdown result={result} />
        </div>
      ) : null}
    </article>
  );
}
