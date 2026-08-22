"use client";

import type { RecommendationResult } from "@/types";

interface ScoreBreakdownProps {
  result: RecommendationResult;
}

export function ScoreBreakdown({ result }: ScoreBreakdownProps) {
  const criteria = result.program.criteria;

  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 border-t-2 border-black pt-3 text-xs sm:text-sm font-bold">
      <div className="bg-yellow-50 border-2 border-black p-2.5 space-y-0.5">
        <div className="text-[11px] font-black uppercase text-amber-900">
          C1: {criteria?.primary_subject?.name ?? "Mapel Utama"}
        </div>
        <div className="font-mono text-xs">Nilai Asli: <strong>{result.primary_score ?? 0}</strong></div>
        <div className="font-mono text-xs">Normalisasi: <strong>{result.normalized_primary}</strong></div>
        <div className="font-mono text-xs text-gray-700">Bobot: {criteria?.primary_weight}</div>
      </div>

      <div className="bg-blue-50 border-2 border-black p-2.5 space-y-0.5">
        <div className="text-[11px] font-black uppercase text-blue-900">
          C2: {criteria?.secondary_subject?.name ?? "Mapel Pendukung"}
        </div>
        <div className="font-mono text-xs">Nilai Asli: <strong>{result.secondary_score ?? 0}</strong></div>
        <div className="font-mono text-xs">Normalisasi: <strong>{result.normalized_secondary}</strong></div>
        <div className="font-mono text-xs text-gray-700">Bobot: {criteria?.secondary_weight ?? 0}</div>
      </div>

      <div className="bg-purple-50 border-2 border-black p-2.5 space-y-0.5">
        <div className="text-[11px] font-black uppercase text-purple-900">
          C3: Minat ({criteria?.interest_category?.name ?? "RIASEC"})
        </div>
        <div className="font-mono text-xs">Skor Minat: <strong>{result.interest_score ?? 0}</strong></div>
        <div className="font-mono text-xs">Normalisasi: <strong>{result.normalized_interest}</strong></div>
        <div className="font-mono text-xs text-gray-700">Bobot: {criteria?.interest_weight}</div>
      </div>
    </div>
  );
}
