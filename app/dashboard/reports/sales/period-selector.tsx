"use client";

import { useRouter } from "next/navigation";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function buildYears() {
  const current = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => current - i).reverse();
}

export function PeriodSelector({ year, month }: { year: number; month: number }) {
  const router = useRouter();

  function navigate(y: number, m: number) {
    router.push(`/dashboard/reports/sales?year=${y}&month=${m}`);
  }

  return (
    <div className="flex items-center gap-3">
      <select
        defaultValue={month}
        onChange={(e) => navigate(year, Number(e.target.value))}
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {MONTHS.map((label, i) => (
          <option key={i} value={i + 1}>{label}</option>
        ))}
      </select>
      <select
        defaultValue={year}
        onChange={(e) => navigate(Number(e.target.value), month)}
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {buildYears().map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}
