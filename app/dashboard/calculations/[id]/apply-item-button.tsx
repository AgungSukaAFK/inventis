"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyRecommendedSafetyStockForProduct } from "./actions";

type Props = {
  calculationId: string;
  productId: string;
  recommendedSafetyStock: number;
  productName: string;
};

export function ApplyItemButton({
  calculationId,
  productId,
  recommendedSafetyStock,
  productName,
}: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handleApply() {
    if (
      !confirm(
        `Terapkan rekomendasi safety stock (${recommendedSafetyStock}) ke produk "${productName}"?`,
      )
    )
      return;

    setState("loading");
    const result = await applyRecommendedSafetyStockForProduct(
      calculationId,
      productId,
      recommendedSafetyStock,
    );

    if (result.error) {
      setErrorMsg(result.error);
      setState("error");
    } else {
      setState("done");
    }
  }

  if (state === "done") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
        <CheckCheck className="h-3.5 w-3.5" />
        Diterapkan
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="xs"
        variant="outline"
        disabled={state === "loading"}
        onClick={handleApply}
      >
        {state === "loading" ? "..." : "Terapkan"}
      </Button>
      {state === "error" && (
        <p className="text-xs text-destructive max-w-28 text-right">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
