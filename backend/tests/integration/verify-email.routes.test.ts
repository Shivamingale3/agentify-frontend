import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

// Mock the verify-email service so the integration test focuses on the HTTP
// contract (validation → 422, success → 200, service-thrown HttpException →
// 400) without any Redis / DB dependencies.
const verifyEmailServiceMock = vi.fn();
vi.mock('../../src/services/verify-email.service.js', () => ({
  verifyEmailService: verifyEmailServiceMock,
}));

// Mock the post-register service so importing the controller (transitively via
// app) never touches the BullMQ queue / Redis.
const postRegisterServiceMock = vi.fn().mockResolvedValue(undefined);
vi.mock('../../src/services/post-register.service.js', () => ({
  postRegisterService: postRegisterServiceMock,
}));

import { HttpException } from '../../src/exceptions/http.exception.js';

describe('POST /api/auth/verify-email', () => {
  beforeEach(() => {
    verifyEmailServiceMock.mockReset();
    postRegisterServiceMock.mockReset().mockResolvedValue(undefined);
  });

  it('returns 200 with a success message when the token is valid', async () => {
    verifyEmailServiceMock.mockResolvedValueOnce(undefined);

    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: '01HQVALIDTOKEN----------------------' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: 'Email verified successfully!',
    });
    expect(verifyEmailServiceMock).toHaveBeenCalledWith({
      token: '01HQVALIDTOKEN----------------------',
    });
  });

  it('returns 422 when the token field is missing', async () => {
    const res = await request(app).post('/api/auth/verify-email').send({});

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(verifyEmailServiceMock).not.toHaveBeenCalled();
  });

  it('returns 422 when the token is an empty string', async () => {
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: '' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(verifyEmailServiceMock).not.toHaveBeenCalled();
  });

  it('returns 400 when the service throws HttpException(400) for an invalid/expired token', async () => {
    verifyEmailServiceMock.mockRejectedValueOnce(
      new HttpException(400, 'Invalid or expired verification link'),
    );

    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: '01HQINVALIDTOKEN---------------------' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: 'Invalid or expired verification link',
    });
  });

  it('is reachable without auth cookies (public route)', async () => {
    // No access_token cookie is sent; the public-route check in
    // authMiddleware should let this request through to the controller.
    verifyEmailServiceMock.mockResolvedValueOnce(undefined);

    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: '01HQANCHORTOKEN----------------------' });

    expect(res.status).not.toBe(401);
  });
});