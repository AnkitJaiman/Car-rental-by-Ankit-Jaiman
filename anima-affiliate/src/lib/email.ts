import { q } from './db';

// Branded emails sent through Resend. Without RESEND_API_KEY they are only recorded in email_log (development).
const BRAND = { ink: '#1C1B1A', accent: '#9C7F52', soft: '#F7F4F0', line: '#E8E2D9' };

function layout(title: string, body: string, cta?: { label: string; url: string }) {
  const app = process.env.APP_URL || '';
  const store = process.env.STORE_URL || 'https://animajewel.store';
  return `<!doctype html><html><body style="margin:0;background:${BRAND.soft};font-family:Georgia,'Times New Roman',serif;color:${BRAND.ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.soft};padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid ${BRAND.line}">
<tr><td style="padding:32px 40px 8px;text-align:center;letter-spacing:.32em;font-size:13px;text-transform:uppercase">Anima Jewels</td></tr>
<tr><td style="padding:0 40px"><div style="height:1px;background:${BRAND.line}"></div></td></tr>
<tr><td style="padding:28px 40px 8px"><h1 style="font-weight:normal;font-size:26px;line-height:1.25;margin:0 0 16px">${title}</h1>
<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#4a4744">${body}</div>
${cta ? `<p style="margin:28px 0 8px"><a href="${cta.url.startsWith('http') ? cta.url : app + cta.url}" style="display:inline-block;background:${BRAND.ink};color:#fff;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:.18em;text-transform:uppercase;padding:14px 28px">${cta.label}</a></p>` : ''}
</td></tr>
<tr><td style="padding:24px 40px 32px;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#8a857f">Anima Jewels Influencer Program · <a href="${store}" style="color:${BRAND.accent}">animajewel.store</a><br>Questions? Reply to this email.</td></tr>
</table></td></tr></table></body></html>`;
}

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

export const templates = {
  applicationReceived: (d: { name: string }) => ({
    subject: 'We received your application',
    html: layout('Thank you for applying', `<p>Hi ${esc(d.name)},</p><p>Thank you for applying to the Anima Jewels Influencer Programme. Our team will review your application. You will receive an email once a decision has been made.</p>`)
  }),
  applicationApproved: (d: { name: string; rate: string }) => ({
    subject: 'Welcome to the Anima Jewels Influencer Program',
    html: layout('You’re approved', `<p>Hi ${esc(d.name)},</p><p>Great news: your application has been approved. Your commission rate is <strong>${esc(d.rate)}</strong> of the eligible product value of every qualifying order.</p><p>Sign in to your dashboard to create your personal discount code.</p>`, { label: 'Open my dashboard', url: '/dashboard' })
  }),
  applicationRejected: (d: { name: string }) => ({
    subject: 'Your Anima Jewels application',
    html: layout('Thank you for your interest', `<p>Hi ${esc(d.name)},</p><p>Thank you for applying to the Anima Jewels Influencer Program. After careful review we are unable to offer a partnership at this time. You are welcome to apply again in the future.</p>`)
  }),
  influencerSuspended: (d: { name: string }) => ({
    subject: 'Your affiliate account has been paused',
    html: layout('Your account is paused', `<p>Hi ${esc(d.name)},</p><p>Your Anima Jewels affiliate account has been paused, and your affiliate code is inactive. Please reply to this email if you have any questions.</p>`)
  }),
  influencerReactivated: (d: { name: string }) => ({
    subject: 'Your affiliate account is active again',
    html: layout('Welcome back', `<p>Hi ${esc(d.name)},</p><p>Your Anima Jewels affiliate account is active again.</p>`, { label: 'Open my dashboard', url: '/dashboard' })
  }),
  codeSubmittedInfluencer: (d: { name: string; code: string }) => ({
    subject: `Code ${d.code} submitted for approval`,
    html: layout('Code submitted', `<p>Hi ${esc(d.name)},</p><p>Your code <strong>${esc(d.code)}</strong> has been submitted. We will email you as soon as it is approved and active.</p>`)
  }),
  codeSubmittedAdmin: (d: { name: string; code: string }) => ({
    subject: `New affiliate code to review: ${d.code}`,
    html: layout('Code awaiting approval', `<p>${esc(d.name)} requested the code <strong>${esc(d.code)}</strong>.</p>`, { label: 'Review codes', url: '/admin/codes' })
  }),
  applicationAdmin: (d: { name: string; instagram: string; followers: number }) => ({
    subject: `New influencer application: ${d.name}`,
    html: layout('New application', `<p><strong>${esc(d.name)}</strong> (${esc(d.instagram)}, ${esc(d.followers)} followers) applied to the program.</p>`, { label: 'Review application', url: '/admin/influencers?status=pending' })
  }),
  codeApproved: (d: { name: string; code: string; discount: string }) => ({
    subject: `Your code ${d.code} is live`,
    html: layout('Your code is live', `<p>Hi ${esc(d.name)},</p><p>Your code <strong style="letter-spacing:.08em">${esc(d.code)}</strong> is now active and gives your followers <strong>${esc(d.discount)} off</strong> at animajewel.store.</p>`, { label: 'View my code', url: '/dashboard/code' })
  }),
  codeRejected: (d: { name: string; code: string }) => ({
    subject: `About your code ${d.code}`,
    html: layout('Please choose another code', `<p>Hi ${esc(d.name)},</p><p>We could not approve the code <strong>${esc(d.code)}</strong>. Please sign in and request a different one.</p>`, { label: 'Request a code', url: '/dashboard/code' })
  }),
  codeDisabled: (d: { name: string; code: string }) => ({
    subject: `Your code ${d.code} has been disabled`,
    html: layout('Code disabled', `<p>Hi ${esc(d.name)},</p><p>Your code <strong>${esc(d.code)}</strong> has been disabled and can no longer be used at checkout. Reply to this email if you have questions.</p>`)
  }),
  newOrder: (d: { name: string; order: string; commission: string }) => ({
    subject: `New order with your code: ${d.order}`,
    html: layout('You have a new order', `<p>Hi ${esc(d.name)},</p><p>Order <strong>${esc(d.order)}</strong> was placed with your code. Estimated commission: <strong>${esc(d.commission)}</strong> (pending until the return window closes).</p>`, { label: 'View orders', url: '/dashboard/orders' })
  }),
  commissionStatus: (d: { name: string; order: string; status: string }) => ({
    subject: `Commission update for ${d.order}`,
    html: layout('Commission updated', `<p>Hi ${esc(d.name)},</p><p>The commission for order <strong>${esc(d.order)}</strong> is now <strong>${esc(d.status)}</strong>.</p>`, { label: 'View orders', url: '/dashboard/orders' })
  }),
  paymentCompleted: (d: { name: string; amount: string; reference: string }) => ({
    subject: `Payment sent: ${d.amount}`,
    html: layout('Your payment is on its way', `<p>Hi ${esc(d.name)},</p><p>We have sent your commission payment of <strong>${esc(d.amount)}</strong>.${d.reference ? ` Reference: ${esc(d.reference)}.` : ''}</p>`, { label: 'View dashboard', url: '/dashboard' })
  }),
  passwordReset: (d: { name: string; url: string }) => ({
    subject: 'Reset your password',
    html: layout('Reset your password', `<p>Hi ${esc(d.name)},</p><p>Use the button below to choose a new password. The link expires in 1 hour. If you did not ask for this, you can ignore this email.</p>`, { label: 'Choose a new password', url: d.url })
  })
};

export type TemplateName = keyof typeof templates;

export async function sendEmail<K extends TemplateName>(to: string, name: K, data: Parameters<(typeof templates)[K]>[0]) {
  const { subject, html } = (templates[name] as (d: any) => { subject: string; html: string })(data);
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    await q('insert into email_log (to_email, template, subject, status) values ($1,$2,$3,$4)', [to, name, subject, 'logged']);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Anima Jewels <partners@animajewel.store>',
        to: [to],
        reply_to: process.env.ADMIN_NOTIFY_EMAIL || undefined,
        subject,
        html
      })
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    await q('insert into email_log (to_email, template, subject, status) values ($1,$2,$3,$4)', [to, name, subject, 'sent']);
  } catch (e: any) {
    // Email problems must never break the main action; they are recorded for the admin.
    await q('insert into email_log (to_email, template, subject, status, error) values ($1,$2,$3,$4,$5)', [to, name, subject, 'failed', String(e?.message ?? e).slice(0, 500)]);
  }
}
