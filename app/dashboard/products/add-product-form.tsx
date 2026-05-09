"use client";

import { useActionState } from "react";
import { createProduct } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { RupiahInput } from "@/components/ui/rupiah-input";
import type { Category } from "@/lib/supabase/types";

const MOVEMENT_OPTIONS = [
  { value: "fast_moving", label: "Fast Moving" },
  { value: "medium_moving", label: "Medium Moving" },
  { value: "slow_moving", label: "Slow Moving" },
];

type ActionState = { error?: string; success?: boolean } | undefined;

export function AddProductForm({
  categories,
  onSuccess,
}: {
  categories: Pick<Category, "id" | "name">[];
  onSuccess?: () => void;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (_, formData) => {
      const result = await createProduct(_, formData);
      if (result.success) onSuccess?.();
      return result;
    },
    undefined,
  );

  return (
    <form action={action}>
      <div className="space-y-4 px-6 py-4 max-h-[60vh] overflow-y-auto">
        {state?.error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" placeholder="contoh: BJS-001" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nama Barang</Label>
            <Input id="name" name="name" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category_id">Kategori</Label>
            <select
              id="category_id"
              name="category_id"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Tanpa Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="movement_category">Kategori Gerak</Label>
            <select
              id="movement_category"
              name="movement_category"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {MOVEMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchase_price">Harga Beli</Label>
            <RupiahInput id="purchase_price" name="purchase_price" defaultValue={0} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="selling_price">Harga Jual</Label>
            <RupiahInput id="selling_price" name="selling_price" defaultValue={0} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="current_stock">Stok Awal</Label>
            <Input
              id="current_stock"
              name="current_stock"
              type="number"
              min={0}
              defaultValue={0}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="safety_stock">Safety Stock</Label>
            <Input
              id="safety_stock"
              name="safety_stock"
              type="number"
              min={0}
              defaultValue={0}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <textarea
            id="description"
            name="description"
            rows={2}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            placeholder="Opsional"
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
          {pending ? "Menyimpan..." : "Tambah Barang"}
        </Button>
      </DialogFooter>
    </form>
  );
}
