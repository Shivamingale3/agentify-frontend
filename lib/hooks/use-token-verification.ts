"use client";

import { useEffect, useState } from "react";

import type { ApiResult } from "@/lib/types";

export type VerificationStatus = "pending" | "valid" | "invalid";

interface VerificationState {
  status: VerificationStatus;
  errorMessage: string | null;
}

type TokenVerifier = (payload: { token: string }) => Promise<ApiResult<unknown>>;

const MISSING_TOKEN_MESSAGE =
  "This link is missing its token. Please use the most recent link we emailed you.";

const PENDING: VerificationState = { status: "pending", errorMessage: null };
const MISSING_TOKEN: VerificationState = {
  status: "invalid",
  errorMessage: MISSING_TOKEN_MESSAGE,
};

/**
 * Checks a one-time link token as soon as the screen mounts.
 *
 * Both flows that arrive from an email — verifying an address and resetting a
 * password — need the same three states, so they share this hook and differ
 * only in the `verify` function they pass in.
 *
 * The result is stored alongside the token it belongs to, so a token change
 * reverts to `pending` on render rather than through a second state update.
 */
export function useTokenVerification(
  token: string | undefined,
  verify: TokenVerifier,
): VerificationState {
  const [resolved, setResolved] = useState<{
    token: string;
    state: VerificationState;
  } | null>(null);

  useEffect(() => {
    if (!token) return;

    let isActive = true;

    verify({ token }).then((result) => {
      if (!isActive) return;
      setResolved({
        token,
        state: result.ok
          ? { status: "valid", errorMessage: null }
          : { status: "invalid", errorMessage: result.error.message },
      });
    });

    return () => {
      isActive = false;
    };
  }, [token, verify]);

  if (!token) return MISSING_TOKEN;
  return resolved?.token === token ? resolved.state : PENDING;
}
