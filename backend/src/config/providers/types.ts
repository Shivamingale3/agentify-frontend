/**
 * Provider-agnostic AI interface used by `AIService`.
 *
 * Each provider adapter implements `generate()` to call its underlying
 * SDK and translates provider-specific errors into our `HttpException`
 * (429 rate limit, 502 upstream failure, 499 client-aborted). Unknown
 * errors are re-thrown raw for the global error handler to surface as 500.
 */

export type AIProviderName = 'gemini' | 'groq';

export interface AIProvider {
  /** Stable identifier for logging / telemetry. */
  readonly name: AIProviderName;

  /**
   * Generate a text response from a single user prompt.
   *
   * Implementations MUST:
   * - Honor the optional `signal` so the upstream client disconnect
   *   cancels the in-flight provider call (prevents orphaned requests
   *   from consuming the provider's rate-limit bucket).
   * - Throw `HttpException(499)` on client abort.
   * - Throw `HttpException(429)` on provider rate limit.
   * - Throw `HttpException(502)` on provider 5xx / unavailability.
   * - Re-throw unknown errors raw.
   */
  generate(prompt: string, signal?: AbortSignal): Promise<string>;
}

/**
 * Environment shape passed to provider constructors. Narrowing the
 * dependency to the specific fields used (instead of the whole env
 * object) keeps the adapters testable in isolation.
 */
export interface AIProviderEnv {
  GROQ_API_KEY?: string | undefined;
  GROQ_MODEL: string;
  GEMINI_API_KEY?: string | undefined;
  GEMINI_MODEL: string;
}
