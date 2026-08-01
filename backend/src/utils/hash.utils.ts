import crypto from 'node:crypto';

export function hashString(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function isHashValid(value: string, storedHash: string): boolean {
  const computedHash = hashString(value);
  return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(storedHash, 'hex'));
}
