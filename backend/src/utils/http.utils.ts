import type { Request } from 'express';
import { UAParser } from 'ua-parser-js';

export interface DeviceInfo {
  ip: string | null;
  userAgent: string | null;
  device: string | null;
}

export function getDeviceInfo(req: Request): DeviceInfo {
  const xForwardedFor = req.headers['x-forwarded-for'];
  const ip =
    typeof xForwardedFor === 'string'
      ? (xForwardedFor.split(',')[0]?.trim() ?? null)
      : (req.ip ?? null);

  const userAgent = req.get('user-agent') ?? null;

  let device: string | null = null;
  if (userAgent) {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const vendorModel = [result.device.vendor, result.device.model].filter(Boolean).join(' ');
    const osBrowser = [result.os.name ?? 'Unknown', result.browser.name].filter(Boolean).join(' ');

    device = (vendorModel || osBrowser || 'Unknown').trim();
  }

  return {
    ip,
    userAgent,
    device,
  };
}
