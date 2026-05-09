"use client";

import { useState, useActionState } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateStock } from "./actions";
import type { Product } from "@/lib/supabase/types";

type ActionState = { error?: string; success?: boolean } | undefined;

export function EditStockDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (_, formData) => {
      const result = await updateStock(_, formData);
      if (result.success) setOpen(false);
      return result;
    },
    undefined,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border border-border px-2 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
        <Pencil className="h-3 w-3" />
        Edit Stok
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <div className="flex-1 min-w-0">
            <DialogTitle>Edit Stok</DialogTitle>
            <DialogDescription>
              {product.name} &mdash; Stok saat ini: <strong>{product.current_stock}</strong>
            </DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <form action={action}>
          <input type="hidden" name="product_id" value={product.id} />
          <div className="space-y-4 px-6 py-4">
            {state?.error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="new_stock">Stok Baru</Label>
              <Input
                id="new_stock"
                name="new_stock"
                type="number"
                min={0}
                defaultValue={product.current_stock}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Catatan</Label>
              <Input
                id="note"
                name="note"
                placeholder="Opsional — alasan perubahan stok"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose
              type="button"
              className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Batal
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
