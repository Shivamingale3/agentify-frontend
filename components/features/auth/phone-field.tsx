"use client";

import type { Control, FieldValues, Path } from "react-hook-form";
import PhoneInput from "react-phone-number-input";

import { CountrySelect } from "@/components/features/auth/country-select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface PhoneFieldProps<TValues extends FieldValues> {
  control: Control<TValues>;
  name: Path<TValues>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

/** Labelled phone input with a country-code select, wired to react-hook-form. */
export function PhoneField<TValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
}: PhoneFieldProps<TValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor={name}>{label}</FormLabel>
          <FormControl>
            <PhoneInput
              id={name}
              international
              countrySelectComponent={CountrySelect}
              placeholder={placeholder}
              disabled={disabled}
              value={field.value}
              onChange={(value) => field.onChange(value ?? "")}
              onBlur={field.onBlur}
              ref={field.ref}
              className="phone-field"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
