"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  defaultValue?: number;
  required?: boolean;
  className?: string;
  id?: string;
};

export function RupiahInput({ name, defaultValue = 0, required, className, id }: Props) {
  const [display, setDisplay] = useState(() =>
    defaultValue > 0 ? defaultValue.toLocaleString("id-ID") : "",
  );
  const [raw, setRaw] = useState(String(defaultValue ?? 0));

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setRaw(digits || "0");
    setDisplay(digits ? Number(digits).toLocaleString("id-ID") : "");
  }

  return (
    <div
      className={cn(
        "flex h-8 items-center rounded-lg border border-input bg-background text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
        className,
      )}
    >
      <span className="pl-2.5 pr-1.5 text-muted-foreground shrink-0 select-none">Rp</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder="0"
        required={required}
        className="flex-1 bg-transparent pr-2.5 outline-none placeholder:text-muted-foreground min-w-0"
      />
      <input type="hidden" name={name} value={raw} />
    </div>
  );
}
