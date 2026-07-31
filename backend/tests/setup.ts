// Silence winston logs in tests by stubbing the logger before any module
// that imports it gets loaded. We use vi.hoisted so the stub is in place
// before the first import of `src/utils/logger.js` (which is pulled in
// transitively by app.ts, services, middlewares, etc.).
import { vi } from 'vitest';

vi.hoisted(() => {
  // noop — placeholder for any future pre-import setup
});

// Stub the logger so test output stays clean. Each method is a no-op.
vi.mock('../src/utils/logger.js', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
  morganStream: { write: vi.fn() },
}));
