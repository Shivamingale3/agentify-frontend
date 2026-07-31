import { ApiError } from '@google/genai';
import { GoogleGenAI } from '@google/genai';
import { HttpException } from '../../exceptions/http.exception.js';
import type { AIProvider, AIProviderEnv } from './types.js';

function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' ||
      // @google/genai wraps the abort as a DOMException with name 'AbortError'
      // through AbortSignal; the SDK may also surface a generic Error with the
      // abort message — cover both shapes.
      error.message.toLowerCase().includes('aborted'))
  );
}

/**
 * The @google/genai SDK, when its internal p-retry loop encounters a
 * retryable HTTP status (429, 5xx), throws a plain `Error` whose message
 * is shaped like `Retryable HTTP Error: <statusText>` BEFORE any `ApiError`
 * wrapping happens. We match those by statusText so the user sees a
 * structured 429/502 JSON response instead of an opaque 500.
 */
function classifySdkHttpError(error: unknown): HttpException | null {
  if (!(error instanceof Error)) return null;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const message = error.message ?? '';
  if (!message.includes('Retryable HTTP Error')) return null;

  if (message.includes('Too Many Requests')) {
    return new HttpException(429, 'AI service rate limit exceeded. Please try again later.');
  }
  // Any other retryable upstream status (Bad Gateway, Service Unavailable, etc.)
  return new HttpException(502, 'AI service is currently unavailable. Please try again later.');
}

/**
 * Gemini adapter built on @google/genai.
 *
 * Encapsulates the client construction (80s timeout, no retries — the SDK
 * default of 5 attempts doubles latency on transient failures and burns
 * the Gemini-side rate-limit budget, causing surprise 429s on the next
 * user attempt) plus the Gemini-specific error classification.
 */
export class GeminiProvider implements AIProvider {
  readonly name = 'gemini' as const;

  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(env: AIProviderEnv) {
    if (!env.GEMINI_API_KEY) {
      // Defensive: env schema enforces this when AI_PROVIDER=gemini.
      throw new Error('GEMINI_API_KEY is required for GeminiProvider.');
    }
    this.client = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
      httpOptions: {
        // 80s so a slow Gemini call answers before nginx's 90s proxy
        // read timeout fires (otherwise users see an opaque HTML 504
        // from nginx instead of a structured JSON error from us).
        timeout: 80_000,
        retryOptions: { attempts: 1 },
      },
    });
    this.model = env.GEMINI_MODEL;
  }

  async generate(prompt: string, signal?: AbortSignal): Promise<string> {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        ...(signal ? { config: { abortSignal: signal } } : {}),
      });
      return response.text ?? '';
    } catch (error) {
      // Client disconnected (nginx 504'd, user navigated away, etc.).
      // Surface a 499 (nginx convention for "client closed request") so
      // logs make the cause obvious; the response is a no-op since the
      // socket is already gone.
      if (isAbortError(error)) {
        throw new HttpException(499, 'Client closed request');
      }

      // Classic @google/genai ApiError path (status code already parsed).
      if (error instanceof ApiError) {
        if (error.status === 429) {
          throw new HttpException(429, 'AI service rate limit exceeded. Please try again later.');
        }
        throw new HttpException(
          502,
          'AI service is currently unavailable. Please try again later.',
        );
      }

      // SDK "Retryable HTTP Error: <statusText>" plain-Error path
      // (thrown from inside p-retry's runFetch before ApiError wrapping).
      const sdkHttpError = classifySdkHttpError(error);
      if (sdkHttpError) {
        throw sdkHttpError;
      }
      throw error;
    }
  }
}
