import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format angka untuk tampilan agar konsisten:
 * - bilangan bulat tampil tanpa koma (mis. 5 → "5")
 * - bilangan desimal dibulatkan ke maksimal 5 angka di belakang koma
 */
export function fmtNum(n: number): string {
  const rounded = Math.round(n * 1e5) / 1e5
  if (Number.isInteger(rounded)) return rounded.toString()
  return rounded.toFixed(5)
}
