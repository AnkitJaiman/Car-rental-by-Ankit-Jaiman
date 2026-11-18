import AuthShell from '@/components/AuthShell';
import { getSettings } from '@/lib/settings';
import { pct } from '@/lib/money';
export const metadata = { title: 'Program terms' };
export const dynamic = 'force-dynamic';

export default async function Terms() {
  const s = await getSettings();
  return (
    <AuthShell wide>
      <p className="eyebrow">Anima Creators</p>
      <h1>Influencer Program terms</h1>
      <div className="small" style={{ lineHeight: 1.7 }}>
        <p><strong>1. Eligibility.</strong> Applications are reviewed by Anima Jewels. Only approved influencers can create codes or earn commission. We may decline or pause any account.</p>
        <p><strong>2. Commission.</strong> The default commission is {pct(s.default_commission_rate)} of the eligible product subtotal Anima Jewels actually receives for orders placed with your code, after discounts and excluding shipping and taxes. Your individual rate is shown in your dashboard and may be changed by Anima Jewels with notice.</p>
        <p><strong>3. Exclusions.</strong> Cancelled, refunded and charged-back orders earn no commission. Partial refunds reduce commission proportionally. Orders on your own purchases may be excluded.</p>
        <p><strong>4. Pending period.</strong> Commissions stay pending for {s.hold_days} days to cover our return window, then become approved and are paid in the next payout.</p>
        <p><strong>5. Codes.</strong> Codes must be approved before they work. The follower discount is set by Anima Jewels. You may not change your discount or commission settings.</p>
        <p><strong>6. Honest promotion.</strong> You must clearly disclose the partnership (e.g. #ad or “paid partnership”) in line with the FTC Endorsement Guides, and describe products accurately. No spam, paid search on our brand name, or coupon-site posting.</p>
        <p><strong>7. Payments.</strong> Payouts are made to the payment details in your profile. You are responsible for any taxes on your earnings.</p>
        <p><strong>8. Privacy.</strong> You will never see customer personal information. We store your data securely and use it only to run the program.</p>
      </div>
    </AuthShell>
  );
}
