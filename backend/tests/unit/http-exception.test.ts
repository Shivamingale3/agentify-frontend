import { describe, it, expect } from 'vitest';
import { HttpException } from '../../src/exceptions/http.exception.js';

describe('HttpException', () => {
  it('is an instance of Error', () => {
    const err = new HttpException(404, 'not found');
    expect(err).toBeInstanceOf(Error);
  });

  it('stores statusCode', () => {
    const err = new HttpException(404, 'not found');
    expect(err.statusCode).toBe(404);
  });

  it('stores message', () => {
    const err = new HttpException(404, 'not found');
    expect(err.message).toBe('not found');
  });

  it('Error.message is also set via super()', () => {
    const err = new HttpException(500, 'boom');
    expect(err.message).toBe('boom');
  });

  it('preserves stack for debugging', () => {
    const err = new HttpException(400, 'bad');
    expect(err.stack).toBeTruthy();
  });

  it('works with various status codes', () => {
    expect(new HttpException(400, 'a').statusCode).toBe(400);
    expect(new HttpException(401, 'a').statusCode).toBe(401);
    expect(new HttpException(403, 'a').statusCode).toBe(403);
    expect(new HttpException(409, 'a').statusCode).toBe(409);
    expect(new HttpException(429, 'a').statusCode).toBe(429);
    expect(new HttpException(502, 'a').statusCode).toBe(502);
  });
});
