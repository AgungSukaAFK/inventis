"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { TooltipContentProps } from "recharts";

export type MonthlySale = { month: string; qty: number; revenue: number };
export type DistItem = { name: string; value: number; color: string };

function fmtRupiah(n: number): string {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

function BarTooltip({
  active,
  payload,
  label,
  showRevenue,
  barLabel,
}: TooltipContentProps & { showRevenue: boolean; barLabel: string }) {
  if (!active || !payload?.length) return null;
  const val = Number((payload[0] as { value: unknown }).value);
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4, color: "#111827" }}>{label}</div>
      <div style={{ color: "#6b7280" }}>
        {barLabel}:{" "}
        <span style={{ fontWeight: 600, color: "#111827" }}>
          {showRevenue ? fmtRupiah(val) : val.toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  );
}

export function SalesTrendChart({
  data,
  showRevenue,
}: {
  data: MonthlySale[];
  showRevenue: boolean;
}) {
  const dataKey = showRevenue ? "revenue" : "qty";
  const barLabel = showRevenue ? "Revenue" : "Qty Terjual";

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: showRevenue ? 60 : 32, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={showRevenue ? (v: number) => fmtRupiah(v) : undefined}
        />
        <Tooltip
          content={(props) => (
            <BarTooltip {...props} showRevenue={showRevenue} barLabel={barLabel} />
          )}
        />
        <Bar
          dataKey={dataKey}
          name={barLabel}
          fill="#dc2626"
          radius={[4, 4, 0, 0]}
          maxBarSize={52}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MovementDonutChart({ data }: { data: DistItem[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative" style={{ width: 160, height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={46}
              outerRadius={74}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-foreground leading-none">{total}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">produk</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ background: item.color }}
            />
            <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
            <span className="text-xs font-semibold tabular-nums">{item.value}</span>
            {total > 0 && (
              <span className="text-[11px] text-muted-foreground w-8 text-right">
                {Math.round((item.value / total) * 100)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
