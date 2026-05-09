"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { applyRecommendedSafetyStock } from "./actions";
import { Button } from "@/components/ui/button";

export function ApplyButton({ calculationId }: { calculationId: string }) {
  const [state, setState] = useState<{ loading: boolean; done: boolean; error?: string }>({
    loading: false,
    done: false,
  });

  async function handleApply() {
    if (!confirm("Terapkan safety stock rekomendasi ke semua produk? Ini akan menimpa nilai safety stock yang ada.")) return;
    setState({ loading: true, done: false });
    const result = await applyRecommendedSafetyStock(calculationId);
    if (result.error) {
      setState({ loading: false, done: false, error: result.error });
    } else {
      setState({ loading: false, done: true });
    }
  }

  if (state.done) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400 font-medium">
        <CheckCheck className="h-4 w-4" />
        Berhasil diterapkan
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button onClick={handleApply} disabled={state.loading} variant="outline">
        {state.loading ? "Menerapkan..." : "Terapkan ke Produk"}
      </Button>
    </div>
  );
}
