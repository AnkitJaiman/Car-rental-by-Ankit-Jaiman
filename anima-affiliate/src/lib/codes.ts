// Affiliate code rules, shared by influencer requests and admin assignment.
export function normaliseCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}
export function validateCode(code: string, min: number, max: number): string | null {
  if (code.length < min || code.length > max) return `Code must be ${min}–${max} characters.`;
  if (!/^[A-Z0-9]+$/.test(code)) return 'Use letters and numbers only (no spaces or symbols).';
  if (/^\d+$/.test(code)) return 'Include at least one letter.';
  return null;
}
