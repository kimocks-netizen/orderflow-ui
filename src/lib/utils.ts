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
  if (amount >= 1e66) return fmt(amount / 1e66, "Vg");     // Vigintillion
  if (amount >= 1e63) return fmt(amount / 1e63, "NvD");    // Novemdecillion
  if (amount >= 1e60) return fmt(amount / 1e60, "OcD");    // Octodecillion
  if (amount >= 1e57) return fmt(amount / 1e57, "SpD");    // Septendecillion
  if (amount >= 1e54) return fmt(amount / 1e54, "SxD");    // Sexdecillion
  if (amount >= 1e51) return fmt(amount / 1e51, "QiD");    // Quindecillion
  if (amount >= 1e48) return fmt(amount / 1e48, "QtD");    // Quattuordecillion
  if (amount >= 1e45) return fmt(amount / 1e45, "TrD");    // Tredecillion
  if (amount >= 1e42) return fmt(amount / 1e42, "DoD");    // Duodecillion
  if (amount >= 1e39) return fmt(amount / 1e39, "UnD");    // Undecillion
  if (amount >= 1e36) return fmt(amount / 1e36, "Dc");     // Decillion
  if (amount >= 1e33) return fmt(amount / 1e33, "No");     // Nonillion
  if (amount >= 1e30) return fmt(amount / 1e30, "Oc");     // Octillion
  if (amount >= 1e27) return fmt(amount / 1e27, "Sp");     // Septillion
  if (amount >= 1e24) return fmt(amount / 1e24, "Sx");     // Sextillion
  if (amount >= 1e21) return fmt(amount / 1e21, "Qi");     // Quintillion
  if (amount >= 1e18) return fmt(amount / 1e18, "Qt");     // Quadrillion (short)
  if (amount >= 1e15) return fmt(amount / 1e15, "Q");      // Quadrillion
  if (amount >= 1e12) return fmt(amount / 1e12, "T");      // Trillion
  if (amount >= 1e9)  return fmt(amount / 1e9,  "B");      // Billion
  if (amount >= 1e6)  return fmt(amount / 1e6,  "M");      // Million
  if (amount >= 1e3)  return fmt(amount / 1e3,  "K");      // Thousand
  return formatCurrency(amount);
}
