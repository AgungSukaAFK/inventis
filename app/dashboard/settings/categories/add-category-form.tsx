"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCategory } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";

type ActionState = { error?: string; success?: boolean } | undefined;

export function AddCategoryForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (_, formData) => {
      const result = await createCategory(_, formData);
      if (result.success) onSuccess?.();
      return result;
    },
    undefined,
  );

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <form action={action}>
      <div className="space-y-4 px-6 py-4">
        {state?.error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
            {state.error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">Nama Kategori</Label>
          <Input
            ref={inputRef}
            id="name"
            name="name"
            placeholder="contoh: Sepatu, Kaos, Celana..."
            required
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
          {pending ? "Menyimpan..." : "Tambah Kategori"}
        </Button>
      </DialogFooter>
    </form>
  );
}
