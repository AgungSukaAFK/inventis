"use client";

import { useState, useEffect } from "react";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
} from "@/components/ui/dialog";
import { getStockHistory } from "./actions";

type HistoryEntry = Awaited<ReturnType<typeof getStockHistory>>[number];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StockHistoryDialog({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getStockHistory(productId).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [open, productId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border border-border px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
        <History className="h-3 w-3" />
        Riwayat
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <div className="flex-1 min-w-0">
            <DialogTitle>Riwayat Stok</DialogTitle>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {productName}
            </p>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-muted" />
              ))}
            </div>
          )}

          {!loading && entries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada riwayat perubahan stok.
            </p>
          )}

          {!loading && entries.length > 0 && (
            <ul className="space-y-2 pt-4">
              {entries.map((entry) => {
                const oldStock =
                  (entry.old_data as { current_stock: number } | null)
                    ?.current_stock ?? 0;
                const newStock =
                  (
                    entry.new_data as {
                      current_stock: number;
                      note?: string;
                    } | null
                  )?.current_stock ?? 0;
                const note = (entry.new_data as { note?: string | null } | null)
                  ?.note;
                const diff = newStock - oldStock;
                const userRaw = entry.user as unknown;
                const userName =
                  userRaw &&
                  typeof userRaw === "object" &&
                  "full_name" in userRaw
                    ? (userRaw as { full_name: string }).full_name
                    : "—";

                return (
                  <li
                    key={entry.id}
                    className="rounded-lg border border-border bg-card px-4 py-3"
                  >
                    {/* Row 1: perubahan stok + badge selisih + tanggal */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="tabular-nums text-muted-foreground w-8 text-right">
                          {oldStock}
                        </span>
                        <span className="text-muted-foreground text-xs">→</span>
                        <span className="tabular-nums font-semibold w-8">
                          {newStock}
                        </span>
                        <span
                          className={cn(
                            "ml-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium",
                            diff > 0
                              ? "bg-green-500/10 text-green-700 dark:text-green-400"
                              : diff < 0
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground",
                          )}
                        >
                          {diff > 0 ? `+${diff}` : diff === 0 ? "±0" : diff}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDate(entry.created_at)}
                      </span>
                    </div>

                    {/* Row 2: siapa + catatan */}
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/70">
                        {userName}
                      </span>
                      {note && (
                        <>
                          <span>·</span>
                          <span className="truncate italic">{note}</span>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
