import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sizeResolver(
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl",
): { height: number; width: number } {
  let dimensions = 48;

  switch (size) {
    case "xs":
      dimensions = 20;
      break;
    case "sm":
      dimensions = 28;
      break;
    case "md":
      dimensions = 40;
      break;
    case "lg":
      dimensions = 56;
      break;
    case "xl":
      dimensions = 80;
      break;
    case "2xl":
      dimensions = 120;
      break;
    case "3xl":
      dimensions = 160;
      break;
    case "4xl":
      dimensions = 220;
      break;
    case "5xl":
      dimensions = 300;
      break;
    default:
      dimensions = 40;
      break;
  }

  return { height: dimensions, width: dimensions };
}
