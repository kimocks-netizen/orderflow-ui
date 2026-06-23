import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `R ${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function abbreviateCurrency(amount: number): string {
  if (amount >= 1_000_000) return `R ${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (amount >= 1_000) return `R ${(amount / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return formatCurrency(amount);
}
