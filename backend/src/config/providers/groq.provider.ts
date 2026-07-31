import Groq from 'groq-sdk';
import { HttpException } from '../../exceptions/http.exception.js';
import type { AIProvider, AIProviderEnv } from './types.js';

/**
 * Groq adapter built on the official `groq-sdk` package
 * (OpenAI-compatible chat completions API).
 *
 * The adapter configures the SDK to mirror the Gemini adapter's reliability
 * posture: 80s request timeout (so a slow call answers before nginx's 90s
 * proxy-read timeout fires) and no automatic retries (the SDK default of 2
 * would double latency on transient failures and consume the rate-limit
 * budget, causing surprise 429s on the next user attempt).
 *
 * `response_format: { type: 'json_object' }` is set unconditionally because
 * every consumer of this adapter (severity suggestion + incident insights)
 * expects verbatim JSON. This makes `parseAIResponse`'s backtick-stripping
 * incidental rather than load-bearing.
 */
export class GroqProvider implements AIProvider {
  readonly name = 'groq' as const;

  private readonly client: Groq;
  private readonly model: string;

  constructor(env: AIProviderEnv) {
    if (!env.GROQ_API_KEY) {
      // Defensive: env schema enforces this when AI_PROVIDER=groq.
      throw new Error('GROQ_API_KEY is required for GroqProvider.');
    }
    this.client = new Groq({
      apiKey: env.GROQ_API_KEY,
      // 80s timeout — see class docstring.
      timeout: 80_000,
      // Disable automatic retries — see class docstring.
      maxRetries: 0,
    });
    this.model = env.GROQ_MODEL;
  }

  async generate(prompt: string, signal?: AbortSignal): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        },
        // Per-request options — pass the caller's AbortSignal straight
        // through so client disconnect cancels the upstream Groq call.
        signal ? { signal } : {},
      );

      return completion.choices[0]?.message.content ?? '';
    } catch (error) {
      // Client disconnected (nginx 504'd, user navigated away, etc.).
      // Surface a 499 (nginx convention) so logs make the cause obvious;
      // the response is a no-op since the socket is already gone.
      if (error instanceof Groq.APIUserAbortError) {
        throw new HttpException(499, 'Client closed request');
      }

      // Explicit upstream rate limit.
      if (error instanceof Groq.RateLimitError) {
        throw new HttpException(429, 'AI service rate limit exceeded. Please try again later.');
      }

      // Network timeout — provider took longer than 80s to respond.
      if (error instanceof Groq.APIConnectionTimeoutError) {
        throw new HttpException(504, 'AI service timed out. Please try again later.');
      }

      // Provider-side 5xx (Internal Server Error, Service Unavailable, etc.).
      if (error instanceof Groq.InternalServerError) {
        throw new HttpException(
          502,
          'AI service is currently unavailable. Please try again later.',
        );
      }

      // Generic APIError covers remaining 4xx (auth, bad request, etc.).
      // Surface these as 502 to the client (upstream issue, not ours) while
      // preserving the provider's message in the response body.
      if (error instanceof Groq.APIError) {
        throw new HttpException(502, `AI service returned an error: ${error.message}`);
      }

      // Unknown shape — rethrow raw so the global error handler maps it
      // to 500 with a generic message.
      throw error;
    }
  }
}
