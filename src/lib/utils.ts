import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `R ${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function abbreviateCurrency(amount: number): string {
  if (!isFinite(amount)) return "R ∞";
  const fmt = (n: number, suffix: string) => `R ${parseFloat(n.toFixed(2))}${suffix}`;
  if (amount >= 1e18) {
    const exp = Math.floor(Math.log10(amount));
    const coeff = amount / Math.pow(10, exp);
    return `R ${parseFloat(coeff.toFixed(2))}×10^${exp}`;
  }
  if (amount >= 1e15) return fmt(amount / 1e15, "Q");
  if (amount >= 1e12) return fmt(amount / 1e12, "T");
  if (amount >= 1e9)  return fmt(amount / 1e9,  "B");
  if (amount >= 1e6)  return fmt(amount / 1e6,  "M");
  if (amount >= 1e3)  return fmt(amount / 1e3,  "K");
  return formatCurrency(amount);
}
