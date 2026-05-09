"use client";

import { useActionState } from "react";
import { updateProfile, changePassword } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Profile } from "@/lib/supabase/types";

const roleLabel: Record<string, string> = {
  owner: "Owner",
  kepala_toko: "Kepala Toko",
  kepala_gudang: "Kepala Gudang",
};

type ActionState = { error?: string; success?: boolean } | undefined;

export function ProfileForm({ profile }: { profile: Profile }) {
  const [profileState, profileAction, profilePending] = useActionState<
    ActionState,
    FormData
  >(updateProfile, undefined);

  const [passwordState, passwordAction, passwordPending] = useActionState<
    ActionState,
    FormData
  >(changePassword, undefined);

  return (
    <div className="space-y-6 max-w-xl">
      {/* Info Akun */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
          <CardDescription>
            Perbarui nama dan nomor telepon Anda.
          </CardDescription>
        </CardHeader>
        <form action={profileAction}>
          <CardContent className="space-y-5">
            {profileState?.error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
                {profileState.error}
              </div>
            )}
            {profileState?.success && (
              <div className="rounded-md bg-green-500/10 border border-green-500/20 px-3 py-2.5 text-sm text-green-700 dark:text-green-400">
                Profil berhasil diperbarui.
              </div>
            )}

            {/* Read-only: email & role */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile.email} disabled readOnly />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={roleLabel[profile.role] ?? profile.role}
                  disabled
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nama Lengkap</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={profile.full_name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={profile.phone ?? ""}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={profilePending}>
                {profilePending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      {/* Ganti Password */}
      <Card>
        <CardHeader>
          <CardTitle>Ganti Password</CardTitle>
          <CardDescription>
            Gunakan password yang kuat dan mudah diingat. Minimal 8 karakter.
          </CardDescription>
        </CardHeader>
        <form action={passwordAction}>
          <CardContent className="space-y-5">
            {passwordState?.error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
                {passwordState.error}
              </div>
            )}
            {passwordState?.success && (
              <div className="rounded-md bg-green-500/10 border border-green-500/20 px-3 py-2.5 text-sm text-green-700 dark:text-green-400">
                Password berhasil diubah.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="current_password">Password Lama</Label>
              <Input
                id="current_password"
                name="current_password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">Password Baru</Label>
              <Input
                id="new_password"
                name="new_password"
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Konfirmasi Password</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                minLength={8}
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={passwordPending}>
                {passwordPending ? "Menyimpan..." : "Ganti Password"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      {/* Bergabung sejak */}
      <p className="text-xs text-muted-foreground px-1">
        Akun dibuat pada{" "}
        {new Date(profile.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        .
      </p>
    </div>
  );
}
