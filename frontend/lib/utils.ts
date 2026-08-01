import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sizeResolver(
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl",
): { height: number; width: number } {
  let height = 100;
  let width = 100;

  switch (size) {
    case "5xl":
      height = 500;
      width = 500;
      break;
    case "4xl":
      height = 400;
      width = 400;
      break;
    case "3xl":
      height = 300;
      width = 300;
      break;
    case "2xl":
      height = 200;
      width = 200;
      break;
    case "xl":
      height = 100;
      width = 100;
      break;
    case "lg":
      height = 50;
      width = 50;
      break;
    case "sm":
      height = 25;
      width = 25;
      break;
    case "xs":
      height = 20;
      width = 20;
      break;

    default:
      height = 100;
      width = 100;
      break;
  }

  return { height, width };
}
