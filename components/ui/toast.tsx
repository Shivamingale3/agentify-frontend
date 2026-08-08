"use client";

import { Toast } from "@base-ui/react/toast";
import {
  RiCheckboxCircleLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiInformationLine,
} from "@remixicon/react";

import { toastManager, type ToastType } from "@/lib/toast";
import { cn } from "@/lib/utils";

const typeIcons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: RiCheckboxCircleLine,
  error: RiErrorWarningLine,
  info: RiInformationLine,
};

function ToastIcon({ type }: { type?: string }) {
  const Icon = typeIcons[(type as ToastType) ?? "info"] ?? RiInformationLine;
  return (
    <Icon
      className={cn(
        "mt-0.5 size-4 shrink-0",
        type === "error" ? "text-destructive" : "text-foreground",
      )}
    />
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager();

  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      data-slot="toast"
      className={cn(
        // Stacking geometry, per Base UI's collapsed-stack recipe: toasts sit
        // on top of each other until the viewport is hovered or focused.
        "[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "[--height:var(--toast-frontmost-height,var(--toast-height))]",
        "[--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]",
        "absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 w-full origin-bottom",
        "h-[var(--height)] data-expanded:h-[var(--toast-height)]",
        "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]",
        "data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]",
        // Enter / exit.
        "data-starting-style:[transform:translateY(150%)] data-ending-style:opacity-0 data-limited:opacity-0",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        // Surface. Square corners to match the rest of the system.
        "rounded-none bg-popover text-sm text-foreground shadow-xl ring-1 ring-foreground/10 select-none",
        "data-[type=error]:ring-destructive/30",
        // Bridges the gap between stacked toasts so hover isn't lost between them.
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
      )}
    >
      <Toast.Content className="flex h-full items-start gap-3 overflow-hidden p-4 transition-opacity duration-250 data-behind:opacity-0 data-expanded:opacity-100">
        <ToastIcon type={toast.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Toast.Title className="text-sm font-semibold" />
          <Toast.Description className="text-xs leading-relaxed text-muted-foreground" />
        </div>
        <Toast.Close
          aria-label="Dismiss notification"
          className="-mt-1 -mr-1 shrink-0 rounded-none p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <RiCloseLine className="size-4" />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ));
}

/**
 * Mount once, near the root of the app. Renders whatever the shared
 * `toast` façade queues.
 */
function Toaster() {
  return (
    <Toast.Provider toastManager={toastManager}>
      <Toast.Portal>
        <Toast.Viewport className="fixed top-auto right-4 bottom-4 left-auto z-50 mx-auto w-[calc(100vw-2rem)] sm:right-8 sm:bottom-8 sm:w-90">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

export { Toaster };
