// Adds clearly labelled TEST data (is_test = true, @example.test emails, "Test ·" names, TEST codes).
// Remove it any time with: node scripts/seed-test.mjs --remove
import pg from 'pg';
import bcrypt from 'bcryptjs';
const url = process.env.DATABASE_URL;
const local = url.includes('localhost') || url.includes('host=/') || process.env.PGSSL === 'off';
const c = new pg.Client({ connectionString: url, ssl: local ? undefined : { rejectUnauthorized: false } });
await c.connect();

async function remove() {
  await c.query(`delete from clicks where code_id in (select id from affiliate_codes where is_test)`);
  const testOrders = `is_test or code_id in (select id from affiliate_codes where is_test)`;
  await c.query(`update affiliate_orders set payout_id = null where ${testOrders}`);
  await c.query(`delete from affiliate_orders where ${testOrders}`);
  await c.query(`delete from commission_adjustments where influencer_id in (select id from influencers where is_test)`);
  await c.query(`delete from payouts where is_test or influencer_id in (select id from influencers where is_test)`);
  await c.query(`delete from affiliate_codes where is_test`);
  await c.query(`delete from users where is_test`);
}
await remove();
if (process.argv.includes('--remove')) { await c.end(); console.log('Test data removed.'); process.exit(0); }

const pw = await bcrypt.hash('TestPassword123', 10);
async function influencer(name, email, status, ig, followers, extra = {}) {
  const u = (await c.query(`insert into users (email, password_hash, role, full_name, phone, country, is_test) values ($1,$2,'influencer',$3,'+1 555 0100','United States',true) returning id`, [email, pw, name])).rows[0];
  const i = (await c.query(
    `insert into influencers (user_id, status, instagram_username, instagram_url, total_followers, audience_country, content_category, introduction, why_collaborate,
       commission_rate, discount_percent, max_discount_percent, applied_at, approved_at, is_test)
     values ($1,$2,$3,$4,$5,'United States','Jewelry & accessories','TEST profile used to check the portal.','TEST application text for development only.',
       $6,10,15, now() - interval '70 days', $7, true) returning id`,
    [u.id, status, ig, `https://instagram.com/${ig}`, followers, extra.rate ?? 10, status === 'approved' || status === 'suspended' ? new Date(Date.now() - 60 * 86400e3) : null]
  )).rows[0];
  return i.id;
}
const anna = await influencer('Test · Anna Rivera', 'anna@example.test', 'approved', 'test_anna', 48200);
const maya = await influencer('Test · Maya Chen', 'maya@example.test', 'approved', 'test_maya', 12900, { rate: 12 });
await influencer('Test · Leo Brooks', 'leo@example.test', 'pending', 'test_leo', 8300);
await influencer('Test · Sara Kim', 'sara@example.test', 'rejected', 'test_sara', 950);
const zoe = await influencer('Test · Zoe Adams', 'zoe@example.test', 'suspended', 'test_zoe', 22000);

const code = async (inf, code, status) => (await c.query(`insert into affiliate_codes (influencer_id, code, discount_percent, status, decided_at, is_test) values ($1,$2,10,$3,now(),true) returning id`, [inf, code, status])).rows[0].id;
const annaCode = await code(anna, 'TESTANNA10', 'active');
await code(maya, 'TESTMAYA10', 'pending_approval');
await code(zoe, 'TESTZOE10', 'disabled');

let n = 9000001;
async function order(inf, codeId, codeStr, daysAgo, subtotal, status, reason = null, rate = 10) {
  const discount = Math.round(subtotal * 0.1 * 100) / 100;
  const eligible = ['cancelled', 'refunded'].includes(status) ? 0 : Math.round((subtotal - discount) * 100) / 100;
  await c.query(`insert into affiliate_orders (shopify_order_id, order_name, influencer_id, code_id, code_used, ordered_at, products_summary, order_subtotal, discount_amount,
      eligible_amount, commission_rate, commission_amount, status, status_reason, is_test)
    values ($1,$2,$3,$4,$5, now() - ($6 || ' days')::interval, $7, $8,$9,$10,$11, round($10::numeric * $11::numeric / 100, 2), $12, $13, true)`,
    [n, `#TEST-${n++ - 9000000}`, inf, codeId, codeStr, String(daysAgo), '1× Test · Montana Sapphire Band (Size 7)', subtotal, discount, eligible, rate, status, reason]);
}
for (const [d, amt, st, r] of [[150, 120, 'approved'], [120, 89, 'approved'], [95, 240, 'approved'], [70, 65, 'refunded', 'Order refunded'], [45, 180, 'approved'], [32, 99, 'approved'], [12, 140, 'pending'], [6, 210, 'pending'], [3, 75, 'cancelled', 'Order cancelled (customer)']]) {
  await order(anna, annaCode, 'TESTANNA10', d, amt, st, r ?? null);
}
for (let i = 0; i < 40; i++) await c.query(`insert into clicks (code_id, clicked_at) values ($1, now() - ($2 || ' days')::interval)`, [annaCode, String(i * 3)]);
await c.end();
console.log('TEST data added. Test influencers sign in with password TestPassword123 (e.g. anna@example.test).');
