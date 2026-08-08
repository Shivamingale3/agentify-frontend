"use client";

import { useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface PasswordFieldProps<TValues extends FieldValues> {
  control: Control<TValues>;
  name: Path<TValues>;
  label: string;
  placeholder?: string;
  autoComplete?: "current-password" | "new-password";
  disabled?: boolean;
  /** Rendered opposite the label — e.g. login's "Forgot password?" link. */
  action?: React.ReactNode;
}

/**
 * A password input with its own show/hide toggle. Every auth screen asks for
 * a password at least once, so the toggle behaviour and its accessible
 * labelling live here rather than being restated per form.
 */
export function PasswordField<TValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  autoComplete = "current-password",
  disabled,
  action,
}: PasswordFieldProps<TValues>) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel htmlFor={name}>{label}</FormLabel>
            {action}
          </div>
          <div className="relative">
            <FormControl>
              <Input
                id={name}
                type={isVisible ? "text" : "password"}
                autoComplete={autoComplete}
                placeholder={placeholder}
                disabled={disabled}
                className="pr-9"
                {...field}
              />
            </FormControl>
            <button
              type="button"
              onClick={() => setIsVisible((visible) => !visible)}
              tabIndex={-1}
              aria-label={isVisible ? "Hide password" : "Show password"}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {isVisible ? (
                <RiEyeOffLine className="size-4" />
              ) : (
                <RiEyeLine className="size-4" />
              )}
            </button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
