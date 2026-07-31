import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

// vi.hoisted makes the mock fn available to the hoisted vi.mock factory.
// Single `generateMock` serves BOTH providers since both adapter mocks
// route through it — whichever provider the factory selects at runtime,
// `generate` returns whatever the test staged on this fn.
const generateMock = vi.hoisted(() => vi.fn());

// Mock both provider adapters so no real network calls ever happen.
// Each mock class exposes the AIProvider shape (`generate`, `name`).
vi.mock('../../src/config/providers/gemini.provider.js', () => ({
  GeminiProvider: class {
    readonly name = 'gemini' as const;
    generate = generateMock;
  },
}));
vi.mock('../../src/config/providers/groq.provider.js', () => ({
  GroqProvider: class {
    readonly name = 'groq' as const;
    generate = generateMock;
  },
}));

// Mock the rate limiter (hoisted) — keeps integration tests focused on
// AI-flow behavior, not throttling.
vi.mock('../../src/middlewares/rateLimiting.middleware.js', () => ({
  createRateLimiter: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  globalRateLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import { HttpException } from '../../src/exceptions/http.exception.js';
import { app } from '../../src/app.js';
import { db, truncateIncidents } from '../helpers/db.ts';

/**
 * Integration tests for the AI routes flow.
 *
 * The integration boundary is `AIService.generate(prompt, signal)`; the
 * actual provider (Gemini or Groq) is mocked here so no real network call
 * is made. Provider-selection logic (env → factory → adapter) is covered
 * by `tests/unit/ai.provider.factory.test.ts`. Provider-specific error
 * mapping (429 / 502 / 499) is covered by the dedicated provider-unit
 * tests in the same folder.
 */
describe('AI routes — HTTP integration (provider mocked)', () => {
  beforeEach(async () => {
    await truncateIncidents();
    generateMock.mockReset();
  });

  describe('POST /api/ai/incident/suggest-severity', () => {
    it('returns 200 with severity + reason when provider returns valid JSON', async () => {
      generateMock.mockResolvedValueOnce(
        '{"severity":"HIGH","reason":"prod db outage, high impact"}',
      );

      const res = await request(app).post('/api/ai/incident/suggest-severity').send({
        title: 'DB outage',
        description: '<p>db unreachable</p>',
        service: 'postgres',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({
        severity: 'HIGH',
        reason: 'prod db outage, high impact',
      });
      expect(generateMock).toHaveBeenCalledTimes(1);
    });

    it('returns 400 when validation fails (missing title)', async () => {
      const res = await request(app)
        .post('/api/ai/incident/suggest-severity')
        .send({ description: '<p>irrelevant</p>' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(generateMock).not.toHaveBeenCalled();
    });

    it('surfaces HttpException(429) as a structured rate-limit response', async () => {
      // Provider adapters throw HttpException for known upstream failures;
      // the global error handler maps the statusCode straight through to
      // the JSON response. Proves the error-mapping path end-to-end
      // without depending on provider-specific exception classes.
      generateMock.mockRejectedValueOnce(
        new HttpException(429, 'AI service rate limit exceeded. Please try again later.'),
      );

      const res = await request(app).post('/api/ai/incident/suggest-severity').send({
        title: 'DB outage',
        description: '<p>db unreachable</p>',
        service: 'postgres',
      });

      expect(res.status).toBe(429);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/rate limit/i);
    });

    it('rethrows unknown errors raw (errorHandler surfaces as 500)', async () => {
      // A plain Error is not a recognized provider APIError subclass, so
      // the adapter rethrows it raw — the global handler maps that to 500.
      generateMock.mockRejectedValueOnce(new Error('network down'));

      const res = await request(app).post('/api/ai/incident/suggest-severity').send({
        title: 'DB outage',
        description: '<p>db unreachable</p>',
        service: 'postgres',
      });

      // Allow 502 in case the handler wrapping changes later.
      expect([500, 502]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/ai/incident/:incidentId/insights', () => {
    it('returns 404 when the incident does not exist', async () => {
      const res = await request(app).get('/api/ai/incident/01NONEXISTENT/insights');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Incident not found');
    });

    it('returns 200 with cached insights when they exist in DB', async () => {
      // Seed an incident directly to control the AI insight columns.
      const created = await db.incident.create({
        data: {
          incidentId: 'INC-CACHED-1',
          title: 'Cached outage',
          description: 'something broke',
          service: 'svc',
          severity: 'HIGH',
          status: 'OPEN',
          summary: 'cached summary',
          possibleCauses: JSON.stringify(['cause1', 'cause2']),
          recommendedActions: JSON.stringify(['action1', 'action2']),
        },
      });

      const res = await request(app).get(`/api/ai/incident/${created.id}/insights`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBe('cached summary');
      expect(res.body.data.possibleCauses).toEqual(['cause1', 'cause2']);
      expect(res.body.data.recommendedActions).toEqual(['action1', 'action2']);
      // Provider must not have been called because cached insights exist.
      expect(generateMock).not.toHaveBeenCalled();
    });

    it('calls the provider and returns 200 with fresh insights when cache is empty', async () => {
      const created = await db.incident.create({
        data: {
          incidentId: 'INC-FRESH-1',
          title: 'Fresh outage',
          description: 'fresh breakdown',
          service: 'svc',
          severity: 'HIGH',
          status: 'OPEN',
        },
      });

      generateMock.mockResolvedValueOnce(
        JSON.stringify({
          summary: 'fresh summary',
          possibleCauses: ['c1', 'c2', 'c3'],
          recommendedActions: ['a1', 'a2', 'a3'],
          confidence: 'MEDIUM',
        }),
      );

      const res = await request(app).get(`/api/ai/incident/${created.id}/insights`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBe('fresh summary');
      expect(generateMock).toHaveBeenCalledTimes(1);

      // Verify insights were persisted
      const updated = await db.incident.findUnique({ where: { id: created.id } });
      expect(updated?.summary).toBe('fresh summary');
      expect(JSON.parse(updated?.possibleCauses ?? '[]')).toEqual(['c1', 'c2', 'c3']);
    });
  });

  describe('PUT /api/ai/incident/:incidentId/insights/regenerate', () => {
    it('returns 404 when the incident does not exist', async () => {
      const res = await request(app).put('/api/ai/incident/01NONEXISTENT/insights/regenerate');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Incident not found');
      expect(generateMock).not.toHaveBeenCalled();
    });

    it('regenerates insights and persists them', async () => {
      const created = await db.incident.create({
        data: {
          incidentId: 'INC-REGEN-1',
          title: 'Regen outage',
          description: 'regen breakdown',
          service: 'svc',
          severity: 'HIGH',
          status: 'OPEN',
          summary: 'old summary',
          possibleCauses: JSON.stringify(['old1']),
          recommendedActions: JSON.stringify(['old1']),
        },
      });

      generateMock.mockResolvedValueOnce(
        JSON.stringify({
          summary: 'new summary',
          possibleCauses: ['new1', 'new2'],
          recommendedActions: ['act1', 'act2'],
          confidence: 'HIGH',
        }),
      );

      const res = await request(app).put(`/api/ai/incident/${created.id}/insights/regenerate`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBe('new summary');
      expect(generateMock).toHaveBeenCalledTimes(1);

      const updated = await db.incident.findUnique({ where: { id: created.id } });
      expect(updated?.summary).toBe('new summary');
      expect(JSON.parse(updated?.possibleCauses ?? '[]')).toEqual(['new1', 'new2']);
    });
  });
});
