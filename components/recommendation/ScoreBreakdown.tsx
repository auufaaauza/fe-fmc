"use client";

import type { RecommendationResult } from "@/types";

interface ScoreBreakdownProps {
  result: RecommendationResult;
}

export function ScoreBreakdown({ result }: ScoreBreakdownProps) {
  const criteria = result.program.criteria;

  const items = [
    {
      title: `C1: ${criteria?.primary_subject?.name ?? "Mapel Utama"}`,
      rows: [
        ["Nilai Asli", result.primary_score ?? 0],
        ["Normalisasi", result.normalized_primary],
        ["Bobot", criteria?.primary_weight],
      ],
      className: "border-amber-100 bg-amber-50/70 text-amber-900",
    },
    {
      title: `C2: ${criteria?.secondary_subject?.name ?? "Mapel Pendukung"}`,
      rows: [
        ["Nilai Asli", result.secondary_score ?? 0],
        ["Normalisasi", result.normalized_secondary],
        ["Bobot", criteria?.secondary_weight ?? 0],
      ],
      className: "border-blue-100 bg-blue-50/70 text-blue-900",
    },
    {
      title: `C3: Minat (${criteria?.interest_category?.name ?? "RIASEC"})`,
      rows: [
        ["Skor Minat", result.interest_score ?? 0],
        ["Normalisasi", result.normalized_interest],
        ["Bobot", criteria?.interest_weight],
      ],
      className: "border-indigo-100 bg-indigo-50/70 text-indigo-900",
    },
  ];

  return (
    <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 text-xs sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className={`space-y-1 rounded-lg border p-3 ${item.className}`}>
          <div className="text-[11px] font-semibold uppercase">{item.title}</div>
          {item.rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-2 font-mono text-xs text-slate-700">
              <span>{label}</span>
              <strong className="text-slate-900">{value}</strong>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
