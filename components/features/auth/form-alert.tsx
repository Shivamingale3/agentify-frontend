import { cn } from "@/lib/utils";

interface FormAlertProps {
  message: string | null;
  /** `error` is the default; `success` is used for confirmation copy. */
  tone?: "error" | "success";
  className?: string;
}

/** Form-level feedback that isn't tied to a single field. */
export function FormAlert({
  message,
  tone = "error",
  className,
}: FormAlertProps) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className={cn(
        "rounded-none px-3 py-2 text-xs",
        tone === "error"
          ? "bg-destructive/10 text-destructive"
          : "bg-foreground/5 text-muted-foreground",
        className,
      )}
    >
      {message}
    </p>
  );
}
