"use client";

import Image from "next/image";
import { useActionState } from "react";
import { login } from "../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type ActionState = { error: string } | undefined;

export default function LoginPage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    login,
    undefined,
  );

  return (
    <Card className="w-full">
      <CardHeader className="items-center text-center pb-4">
        {/* Logo */}
        <Image
          src="/logo-bj.png"
          alt="Banten Jaya Sport Fashion"
          width={52}
          height={52}
          className="rounded-full mx-auto"
        />
        <div className="leading-tight mb-1">
          <p className="text-lg font-bold text-primary leading-none">
            Inventis
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Banten Jaya Sport Fashion
          </p>
        </div>

        <CardTitle className="text-xl">Masuk ke sistem</CardTitle>
        <CardDescription>
          Masukkan email dan password untuk melanjutkan
        </CardDescription>
      </CardHeader>

      <form action={action}>
        <CardContent className="space-y-5">
          {state?.error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contoh@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Memproses..." : "Masuk"}
          </Button>

          <p className="text-xs text-muted-foreground text-center pb-1">
            Belum punya akun? Hubungi pemilik toko.
          </p>
        </CardContent>
      </form>
    </Card>
  );
}
