import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { FIELD_ERROR_CODES } from "@/lib/enums";
import type { ApiError } from "@/lib/types";

/**
 * Maps a failed `ApiResult` onto a react-hook-form instance: per-field
 * messages land on their fields, and the message meant for the form as a
 * whole is returned for the caller to render.
 *
 * Only fields the form actually owns are touched, so a backend that reports
 * an unknown field can never wedge the form into a permanently invalid state.
 */
export function applyServerErrors<TValues extends FieldValues>(
  form: UseFormReturn<TValues>,
  error: ApiError,
  fallbackMessage: string,
): string {
  if (FIELD_ERROR_CODES.includes(error.code) && error.fieldErrors) {
    const knownFields = new Set(Object.keys(form.getValues()));

    for (const [field, message] of Object.entries(error.fieldErrors)) {
      if (!message || !knownFields.has(field)) continue;
      form.setError(field as Path<TValues>, { type: "server", message });
    }
  }

  return error.message || fallbackMessage;
}
