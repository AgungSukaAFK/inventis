"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  name: string;
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
};

export function PhoneInput({ id, name, defaultValue = "", disabled, className }: Props) {
  const [value, setValue] = useState(defaultValue);

  const invalid = value.length > 0 && !value.startsWith("08");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 13);
    setValue(digits);
  }

  return (
    <div className="space-y-1">
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="08xxxxxxxxxx"
        maxLength={13}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          invalid && "border-destructive focus-visible:ring-destructive",
          className,
        )}
      />
      {invalid && (
        <p className="text-xs text-destructive">Nomor telepon harus diawali dengan 08.</p>
      )}
    </div>
  );
}
