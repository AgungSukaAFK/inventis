"use client";

import { useActionState } from "react";
import { createUser } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";

const ROLES = [
  { value: "kepala_gudang", label: "Kepala Gudang" },
  { value: "kepala_toko", label: "Kepala Toko" },
];

type ActionState = { error?: string; success?: boolean } | undefined;

export function CreateUserForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (_, formData) => {
      const result = await createUser(formData);
      if (result.success) onSuccess?.();
      return result;
    },
    undefined,
  );

  return (
    <form action={action}>
      <div className="space-y-4 px-6 py-4">
        {state?.error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nama Lengkap</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">No. Telepon</Label>
            <Input id="phone" name="phone" type="tel" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password Sementara</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DialogFooter>
        {/* type="button" wajib supaya tidak trigger form submit */}
        <DialogClose
          type="button"
          className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Batal
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Buat Pengguna"}
        </Button>
      </DialogFooter>
    </form>
  );
}
