"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef } from "react";
import { Search } from "lucide-react";
import type { Category } from "@/lib/supabase/types";

const MOVEMENT_OPTIONS = [
  { value: "", label: "Semua Kategori Gerak" },
  { value: "fast_moving", label: "Fast Moving" },
  { value: "medium_moving", label: "Medium Moving" },
  { value: "slow_moving", label: "Slow Moving" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

const SORT_OPTIONS = [
  { value: "name", label: "Nama" },
  { value: "current_stock", label: "Stok" },
  { value: "created_at", label: "Tanggal Dibuat" },
];

const SELECT_CLASS =
  "h-8 rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

type Props = {
  categories: Pick<Category, "id" | "name">[];
};

export function ProductsFilters({ categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  function handleSearch(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam("q", value), 400);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Search — flex wrapper avoids absolute-positioning issues with Input internals */}
      <div className="flex h-8 items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 text-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 w-52">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <input
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          placeholder="Cari nama / SKU..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <select
        className={SELECT_CLASS}
        value={searchParams.get("category") ?? ""}
        onChange={(e) => updateParam("category", e.target.value)}
      >
        <option value="">Semua Kategori</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        className={SELECT_CLASS}
        value={searchParams.get("movement") ?? ""}
        onChange={(e) => updateParam("movement", e.target.value)}
      >
        {MOVEMENT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        className={SELECT_CLASS}
        value={searchParams.get("status") ?? ""}
        onChange={(e) => updateParam("status", e.target.value)}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        className={SELECT_CLASS}
        value={searchParams.get("sort") ?? "name"}
        onChange={(e) => updateParam("sort", e.target.value)}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            Urut: {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
