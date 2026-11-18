// Unit tests for commission rules. Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Load the TypeScript module directly (no build step needed for tests).
const src = fs.readFileSync(new URL('../src/lib/commission.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
const { computeCommission, codesOnOrder, productsSummary } = mod;

const base = { total_line_items_price: '200.00', current_total_discounts: '20.00', current_subtotal_price: '180.00', current_total_tax: '14.40', taxes_included: false, financial_status: 'paid', cancelled_at: null,
  shipping_lines: [{ price: '9.00', tax_lines: [] }], line_items: [{ title: 'Ring', quantity: 1, variant_title: 'Size 7', tax_lines: [{ price: '14.40' }] }], discount_codes: [{ code: 'anna10' }] };

test('10% of the product subtotal after discount; shipping and tax excluded', () => {
  const r = computeCommission(base, 10);
  assert.equal(r.eligible, 180); assert.equal(r.commission, 18); assert.equal(r.status, null);
});
test('tax is removed when prices include tax (but not shipping tax)', () => {
  const r = computeCommission({ ...base, taxes_included: true, current_total_tax: '16.40', shipping_lines: [{ tax_lines: [{ price: '2.00' }] }] }, 10);
  assert.equal(r.eligible, 165.6); assert.equal(r.commission, 16.56);
});
test('partial refund reduces commission', () => {
  const r = computeCommission({ ...base, current_subtotal_price: '90.00', financial_status: 'partially_refunded' }, 10);
  assert.equal(r.commission, 9); assert.match(r.reason, /Partially refunded/);
});
test('full refund, cancellation, void and chargeback earn nothing', () => {
  assert.deepEqual([computeCommission({ ...base, financial_status: 'refunded' }, 10).status, computeCommission({ ...base, financial_status: 'refunded' }, 10).commission], ['refunded', 0]);
  assert.equal(computeCommission({ ...base, cancelled_at: '2026-01-01T00:00:00Z' }, 10).status, 'cancelled');
  assert.equal(computeCommission({ ...base, financial_status: 'voided' }, 10).commission, 0);
  const cb = computeCommission(base, 10, true); assert.equal(cb.status, 'refunded'); assert.equal(cb.reason, 'Chargeback'); assert.equal(cb.commission, 0);
});
test('per-influencer rate and rounding', () => {
  assert.equal(computeCommission({ ...base, current_subtotal_price: '99.99' }, 12.5).commission, 12.5);
});
test('codes are matched case-insensitively; no customer data in summary', () => {
  assert.deepEqual(codesOnOrder(base), ['ANNA10']);
  assert.equal(productsSummary({ ...base, email: 'buyer@x.com', customer: { first_name: 'Jo' } }), '1× Ring (Size 7)');
});
