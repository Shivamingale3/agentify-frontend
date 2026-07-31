import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

// Mock the rate limiter so integration tests don't trip in-memory limits.
// `vi.mock` is hoisted above the import of `app` below by vitest.
vi.mock('../../src/middlewares/rateLimiting.middleware.js', () => ({
  createRateLimiter: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  globalRateLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import { app } from '../../src/app.js';
import { truncateIncidents } from '../helpers/db.ts';

const sampleIncident = {
  title: 'API outage',
  incidentId: 'INC-TEST-1',
  description: '<p>something broke badly</p>',
  service: 'api-gateway',
  severity: 'HIGH',
  status: 'OPEN',
  assignee: 'on-call',
};

describe('Incident routes — HTTP integration', () => {
  beforeEach(async () => {
    await truncateIncidents();
  });

  describe('POST /api/incident', () => {
    it('creates an incident and returns 201', async () => {
      const res = await request(app).post('/api/incident').send(sampleIncident);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        success: true,
        message: 'Incident created successfully',
        data: null,
      });
    });

    it('persists the created incident to the database', async () => {
      await request(app).post('/api/incident').send(sampleIncident);
      const list = await request(app).get('/api/incident/filter');

      expect(list.body.data.data).toHaveLength(1);
      expect(list.body.data.data[0].incidentId).toBe('INC-TEST-1');
      expect(list.body.data.data[0].title).toBe('API outage');
    });

    it('returns 400 when required fields (incidentId) are missing', async () => {
      const res = await request(app).post('/api/incident').send({ title: 'x' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when title is empty', async () => {
      const res = await request(app)
        .post('/api/incident')
        .send({ ...sampleIncident, title: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when incidentId does not start with INC', async () => {
      const res = await request(app)
        .post('/api/incident')
        .send({ ...sampleIncident, incidentId: 'XYZ-1' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when severity is an invalid enum value', async () => {
      const res = await request(app)
        .post('/api/incident')
        .send({ ...sampleIncident, severity: 'URGENT' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 409 when an incident with the same incidentId already exists', async () => {
      await request(app).post('/api/incident').send(sampleIncident);
      const res = await request(app).post('/api/incident').send(sampleIncident);

      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        success: false,
        message: 'Incident with this ID already exists',
      });
    });
  });

  describe('GET /api/incident/filter', () => {
    beforeEach(async () => {
      await request(app).post('/api/incident').send(sampleIncident);
      await request(app)
        .post('/api/incident')
        .send({ ...sampleIncident, incidentId: 'INC-TEST-2', severity: 'LOW' });
    });

    it('returns 200 with the default pagination applied', async () => {
      const res = await request(app).get('/api/incident/filter');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toHaveLength(2);
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.pageSize).toBe(10);
      expect(res.body.data.total).toBe(2);
    });

    it('filters by status', async () => {
      const res = await request(app).get('/api/incident/filter?status=OPEN');

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(2);
    });

    it('filters by severity', async () => {
      const res = await request(app).get('/api/incident/filter?severity=LOW');

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.data[0].severity).toBe('LOW');
    });

    it('filters by searchQuery', async () => {
      const res = await request(app).get('/api/incident/filter?searchQuery=INC-TEST-1');

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.data[0].incidentId).toBe('INC-TEST-1');
    });

    it('returns 400 for an invalid status enum', async () => {
      const res = await request(app).get('/api/incident/filter?status=DONE');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 for an invalid severity enum', async () => {
      const res = await request(app).get('/api/incident/filter?severity=URGENT');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('applies pageSize and pageNo', async () => {
      const res = await request(app).get('/api/incident/filter?pageNo=1&pageSize=1');

      expect(res.status).toBe(200);
      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.pageSize).toBe(1);
      expect(res.body.data.totalPages).toBe(2);
    });
  });

  describe('GET /api/incident/kpis', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/incident')
        .send({
          ...sampleIncident,
          status: 'OPEN',
          severity: 'CRITICAL',
        });
      await request(app)
        .post('/api/incident')
        .send({ ...sampleIncident, incidentId: 'INC-TEST-K2', status: 'RESOLVED' });
    });

    it('returns 200 with the KPI array', async () => {
      const res = await request(app).get('/api/incident/kpis');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(4);

      const titles = res.body.data.map((k: { title: string }) => k.title);
      expect(titles).toContain('TOTAL INCIDENTS');
      expect(titles).toContain('OPEN INCIDENTS');
      expect(titles).toContain('CRITICAL INCIDENTS');
      expect(titles).toContain('RESOLVED INCIDENTS');
    });
  });

  describe('GET /api/incident/:id', () => {
    it('returns 200 with the incident when found', async () => {
      await request(app).post('/api/incident').send(sampleIncident);
      const list = await request(app).get('/api/incident/filter');
      const id = list.body.data.data[0].id;

      const res = await request(app).get(`/api/incident/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.incidentId).toBe('INC-TEST-1');
    });

    it('returns 404 when the incident does not exist', async () => {
      const res = await request(app).get('/api/incident/01NONEXISTENT');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Incident not found',
      });
    });
  });

  describe('PATCH /api/incident/:incidentId/status/:status', () => {
    it('updates the status and returns 200', async () => {
      await request(app).post('/api/incident').send(sampleIncident);
      const list = await request(app).get('/api/incident/filter');
      const id = list.body.data.data[0].id;

      const res = await request(app).patch(`/api/incident/${id}/status/RESOLVED`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Incident status updated successfully',
        data: null,
      });

      const getRes = await request(app).get(`/api/incident/${id}`);
      expect(getRes.body.data.status).toBe('RESOLVED');
    });

    it('returns 400 for an invalid status enum', async () => {
      await request(app).post('/api/incident').send(sampleIncident);
      const list = await request(app).get('/api/incident/filter');
      const id = list.body.data.data[0].id;

      const res = await request(app).patch(`/api/incident/${id}/status/DONE`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 404 when updating a nonexistent incident', async () => {
      const res = await request(app).patch('/api/incident/01NONEXISTENT/status/OPEN');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Incident not found');
    });
  });

  describe('PATCH /api/incident/:incidentId/severity/:severity', () => {
    it('updates the severity and returns 200', async () => {
      await request(app).post('/api/incident').send(sampleIncident);
      const list = await request(app).get('/api/incident/filter');
      const id = list.body.data.data[0].id;

      const res = await request(app).patch(`/api/incident/${id}/severity/CRITICAL`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const getRes = await request(app).get(`/api/incident/${id}`);
      expect(getRes.body.data.severity).toBe('CRITICAL');
    });

    it('returns 400 for an invalid severity enum', async () => {
      await request(app).post('/api/incident').send(sampleIncident);
      const list = await request(app).get('/api/incident/filter');
      const id = list.body.data.data[0].id;

      const res = await request(app).patch(`/api/incident/${id}/severity/URGENT`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
