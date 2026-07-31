import { env } from './env.config.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { GroqProvider } from './providers/groq.provider.js';
import type { AIProvider } from './providers/types.js';

/**
 * Lazily-constructed singleton AI provider.
 *
 * The active implementation is picked from `env.AI_PROVIDER` at first use
 * and cached for the process lifetime — provider construction does network
 * setup (HTTP client, timeouts, retries) that we don't want to repeat per
 * request.
 */
let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;
  cached = env.AI_PROVIDER === 'gemini' ? new GeminiProvider(env) : new GroqProvider(env);
  return cached;
}

/**
 * Test-only escape hatch: reset the cached singleton so the next
 * `getAIProvider()` call rebuilds it against the current env. Required for
 * integration tests that swap `AI_PROVIDER` between describe blocks (since
 * `env` is a frozen module-level singleton otherwise).
 */
export function __resetAIProviderForTests(): void {
  cached = null;
}
