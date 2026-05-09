"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteCategory } from "./actions";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/supabase/types";

export function CategoriesList({ categories }: { categories: Category[] }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});

  async function handleDelete(id: string) {
    if (pending[id]) return;
    setPending((p) => ({ ...p, [id]: true }));
    setErrors((e) => ({ ...e, [id]: "" }));

    const result = await deleteCategory(id);

    if (result.error) {
      setErrors((e) => ({ ...e, [id]: result.error! }));
      setPending((p) => ({ ...p, [id]: false }));
    }
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Belum ada kategori. Tambahkan kategori pertama.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {categories.map((cat) => (
        <li key={cat.id}>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">{cat.name}</span>
            <button
              type="button"
              onClick={() => handleDelete(cat.id)}
              disabled={pending[cat.id]}
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                pending[cat.id]
                  ? "border-border text-muted-foreground opacity-50 cursor-not-allowed"
                  : "border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer",
              )}
              aria-label={`Hapus kategori ${cat.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {errors[cat.id] && (
            <p className="px-4 pb-2 text-xs text-destructive">{errors[cat.id]}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
