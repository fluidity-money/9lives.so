import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function combineClass(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
