import 'server-only';
// SITE_URL takes precedence when the public domain differs from the request origin.
export function siteOrigin(): string {
  const configured = process.env.SITE_URL || process.env.APP_ORIGIN || (process.env.RAILWAY_PUBLIC_DOMAIN ? 'https://' + process.env.RAILWAY_PUBLIC_DOMAIN : 'https://wickd-production.up.railway.app');
  const url = new URL(configured);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('SITE_URL must be an HTTP(S) URL.');
  return url.origin;
}
export function canonical(path: string): string { return new URL(path, siteOrigin()).href; }
