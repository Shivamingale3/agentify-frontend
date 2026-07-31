import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Unit tests for the AI provider factory (`getAIProvider`).
 *
 * Strategy: mock `env.config.js` to return a controllable `env` object per
 * test (so we can swap `AI_PROVIDER` without reloading any other module),
 * then dynamically import the factory and reset its singleton between
 * cases. Both provider classes are mocked too — we're testing selection
 * logic and the `name` exposed on the returned adapter, not the actual
 * provider SDK calls (those are covered by the integration test + the
 * adapters' own error mapping).
 */

const geminiCtor = vi.hoisted(() => vi.fn());
const groqCtor = vi.hoisted(() => vi.fn());

vi.mock('../../src/config/providers/gemini.provider.js', () => ({
  GeminiProvider: class {
    readonly name = 'gemini' as const;
    constructor(_env: unknown) {
      geminiCtor(_env);
    }
    generate = vi.fn();
  },
}));
vi.mock('../../src/config/providers/groq.provider.js', () => ({
  GroqProvider: class {
    readonly name = 'groq' as const;
    constructor(_env: unknown) {
      groqCtor(_env);
    }
    generate = vi.fn();
  },
}));

// Mutable env stub — tests mutate this then call the dynamically-imported
// __resetAIProviderForTests() so the next getAIProvider() reads fresh values.
const envStub = {
  APP_PORT: 5000,
  APP_ENV: 'test' as const,
  DATABASE_URL: 'file:./t.db',
  AI_PROVIDER: 'groq' as 'groq' | 'gemini',
  GROQ_API_KEY: 'k' as string | undefined,
  GROQ_MODEL: 'llama-3.3-70b-versatile',
  GEMINI_API_KEY: undefined as string | undefined,
  GEMINI_MODEL: 'gemini-2.0-flash',
};

vi.mock('../../src/config/env.config.js', () => ({
  get env() {
    return envStub;
  },
}));

async function loadFactory() {
  // Dynamic import so vi.resetModules between tests gives us a fresh factory.
  vi.resetModules();
  return await import('../../src/config/ai.config.js');
}

describe('getAIProvider() factory selection', () => {
  beforeEach(() => {
    geminiCtor.mockClear();
    groqCtor.mockClear();
  });

  afterEach(() => {
    envStub.AI_PROVIDER = 'groq';
    envStub.GROQ_API_KEY = 'k';
    envStub.GEMINI_API_KEY = undefined;
  });

  it('selects GroqProvider when AI_PROVIDER=groq', async () => {
    envStub.AI_PROVIDER = 'groq';
    envStub.GROQ_API_KEY = 'groq-key';
    const { getAIProvider } = await loadFactory();

    const provider = getAIProvider();
    expect(provider.name).toBe('groq');
    expect(groqCtor).toHaveBeenCalledTimes(1);
    expect(geminiCtor).not.toHaveBeenCalled();
  });

  it('selects GeminiProvider when AI_PROVIDER=gemini', async () => {
    envStub.AI_PROVIDER = 'gemini';
    envStub.GEMINI_API_KEY = 'gemini-key';
    const { getAIProvider } = await loadFactory();

    const provider = getAIProvider();
    expect(provider.name).toBe('gemini');
    expect(geminiCtor).toHaveBeenCalledTimes(1);
    expect(groqCtor).not.toHaveBeenCalled();
  });

  it('caches the singleton across calls until reset', async () => {
    envStub.AI_PROVIDER = 'groq';
    envStub.GROQ_API_KEY = 'groq-key';
    const { getAIProvider, __resetAIProviderForTests } = await loadFactory();

    const first = getAIProvider();
    const second = getAIProvider();
    expect(first).toBe(second); // same cached instance
    expect(groqCtor).toHaveBeenCalledTimes(1); // constructor ran once
  });

  it('__resetAIProviderForTests forces re-selection on the next call', async () => {
    envStub.AI_PROVIDER = 'groq';
    envStub.GROQ_API_KEY = 'groq-key';
    const { getAIProvider, __resetAIProviderForTests } = await loadFactory();

    getAIProvider();
    expect(groqCtor).toHaveBeenCalledTimes(1);

    envStub.AI_PROVIDER = 'gemini';
    envStub.GEMINI_API_KEY = 'gemini-key';
    __resetAIProviderForTests();
    const provider = getAIProvider();
    expect(provider.name).toBe('gemini');
    expect(geminiCtor).toHaveBeenCalledTimes(1);
    expect(groqCtor).toHaveBeenCalledTimes(1); // not called again
  });
});
