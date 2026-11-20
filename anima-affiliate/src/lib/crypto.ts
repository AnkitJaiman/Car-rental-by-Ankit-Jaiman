import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

// Payment details are encrypted at rest with AES-256-GCM. The key never leaves the server.
function key(): Buffer {
  const raw = process.env.PAYMENT_ENCRYPTION_KEY;
  if (!raw || raw.length < 16) throw new Error('PAYMENT_ENCRYPTION_KEY is not set');
  return createHash('sha256').update(raw).digest();
}
export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), enc].map((b) => b.toString('base64')).join('.');
}
export function decrypt(payload: string): string {
  const [iv, tag, enc] = payload.split('.').map((s) => Buffer.from(s, 'base64'));
  const d = createDecipheriv('aes-256-gcm', key(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]).toString('utf8');
}
export function sha256(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}
