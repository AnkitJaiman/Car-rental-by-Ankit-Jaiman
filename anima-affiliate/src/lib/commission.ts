// Pure commission logic for Shopify order payloads (REST/webhook JSON). No database access here.

export type CommissionResult = {
  eligible: number;          // product value actually received, excluding shipping, tax and refunds
  subtotal: number;          // product subtotal before discounts
  discount: number;          // discounts applied
  commission: number;
  status: 'pending' | 'cancelled' | 'refunded' | null; // null = keep current (pending/approved/paid)
  reason: string | null;
};

const n = (v: unknown) => Math.round(Number(v ?? 0) * 100) / 100;

export function computeCommission(order: any, ratePercent: number, chargeback = false): CommissionResult {
  const subtotal = n(order.total_line_items_price ?? order.subtotal_price);
  const discount = n(order.current_total_discounts ?? order.total_discounts);
  // current_subtotal_price = line items after discounts and refunds; shipping is never included.
  let eligible = n(order.current_subtotal_price ?? order.subtotal_price);
  // When prices include tax, remove the tax portion so commission is never paid on tax.
  if (order.taxes_included) {
    const shippingTax = (order.shipping_lines ?? []).reduce(
      (s: number, sl: any) => s + (sl.tax_lines ?? []).reduce((t: number, tl: any) => t + Number(tl.price ?? 0), 0), 0);
    const tax = Number(order.current_total_tax ?? order.total_tax ?? 0) - shippingTax;
    eligible = n(eligible - Math.max(tax, 0));
  }
  if (eligible < 0) eligible = 0;

  let status: CommissionResult['status'] = null;
  let reason: string | null = null;
  if (order.cancelled_at) {
    status = 'cancelled'; reason = `Order cancelled${order.cancel_reason ? ` (${order.cancel_reason})` : ''}`; eligible = 0;
  } else if (chargeback) {
    status = 'refunded'; reason = 'Chargeback'; eligible = 0;
  } else if (order.financial_status === 'refunded' || order.financial_status === 'voided') {
    status = 'refunded'; reason = order.financial_status === 'voided' ? 'Payment voided' : 'Order refunded'; eligible = 0;
  } else if (order.financial_status === 'partially_refunded') {
    reason = 'Partially refunded: commission recalculated';
  }
  const commission = n((eligible * ratePercent) / 100);
  return { eligible, subtotal, discount, commission, status, reason };
}

export function productsSummary(order: any): string {
  const items = (order.line_items ?? []).map((li: any) => `${li.quantity}× ${li.title}${li.variant_title ? ` (${li.variant_title})` : ''}`);
  const s = items.join(', ');
  return s.length > 300 ? s.slice(0, 297) + '…' : s || '—';
}

export function codesOnOrder(order: any): string[] {
  return (order.discount_codes ?? []).map((d: any) => String(d.code ?? '').toUpperCase()).filter(Boolean);
}
