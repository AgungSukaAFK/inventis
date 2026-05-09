"use client";

import { useState } from "react";
import { PackagePlus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
} from "@/components/ui/dialog";
import { AddProductForm } from "./add-product-form";
import type { Category } from "@/lib/supabase/types";

export function AddProductDialog({
  categories,
}: {
  categories: Pick<Category, "id" | "name">[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50">
        <PackagePlus className="h-4 w-4" />
        Tambah Barang
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <div className="flex-1 min-w-0">
            <DialogTitle>Tambah Barang Baru</DialogTitle>
            <DialogDescription>
              Isi informasi barang dan stok awal. SKU harus unik.
            </DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <AddProductForm categories={categories} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
