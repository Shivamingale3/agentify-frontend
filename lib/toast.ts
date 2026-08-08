"use client";

import { Toast } from "@base-ui/react/toast";

/**
 * A single app-wide toast manager. Living outside the React tree means any
 * module — a form submit handler, a service caller — can queue a toast
 * without threading a hook through the component that happens to be mounted.
 */
export const toastManager = Toast.createToastManager();

export type ToastType = "success" | "error" | "info";

interface ToastOptions {
  description?: string;
  /** `0` keeps the toast up until it is dismissed. */
  timeout?: number;
}

function show(type: ToastType, title: string, options: ToastOptions = {}) {
  return toastManager.add({
    type,
    title,
    priority: type === "error" ? "high" : "low",
    ...options,
  });
}

/**
 * Façade over the toast manager. Components depend on this narrow surface
 * rather than on Base UI directly, so the notification library stays swappable.
 */
export const toast = {
  success: (title: string, options?: ToastOptions) => show("success", title, options),
  error: (title: string, options?: ToastOptions) => show("error", title, options),
  info: (title: string, options?: ToastOptions) => show("info", title, options),
  dismiss: (toastId?: string) => toastManager.close(toastId),
};
