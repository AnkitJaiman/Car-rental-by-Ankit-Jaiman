import Link from 'next/link';
import AuthShell from '@/components/AuthShell';
import { Notice } from '@/components/ui';
import { applyAction } from '../actions/auth';
export const metadata = { title: 'Apply to the Influencer Program' };

const CATEGORIES = ['Jewelry & accessories', 'Fashion & style', 'Beauty', 'Lifestyle', 'Bridal & weddings', 'Travel', 'Other'];

export default function Apply({ searchParams }: { searchParams: { err?: string } }) {
  return (
    <AuthShell wide>
      <p className="eyebrow">Anima Creators</p>
      <h1>Apply to the Influencer Program</h1>
      <p className="muted">Tell us about you and your audience. Our team reviews every application and replies by email.</p>
      <Notice err={searchParams.err} />
      <form action={applyAction} className="form" style={{ marginTop: 20 }}>
        <div className="row">
          <label><span>Full name <span className="req">*</span></span><input name="full_name" required autoComplete="name" /></label>
          <label><span>Email address <span className="req">*</span></span><input name="email" type="email" required autoComplete="email" /></label>
        </div>
        <div className="row">
          <label><span>Phone number <span className="req">*</span></span><input name="phone" type="tel" required autoComplete="tel" /></label>
          <label><span>Country <span className="req">*</span></span><input name="country" required autoComplete="country-name" /></label>
        </div>
        <div className="row">
          <label><span>Instagram username <span className="req">*</span></span><input name="instagram_username" required placeholder="@yourname" /></label>
          <label><span>Instagram profile URL <span className="req">*</span></span><input name="instagram_url" type="url" required placeholder="https://instagram.com/yourname" /></label>
        </div>
        <div className="row">
          <label><span>TikTok profile URL</span><input name="tiktok_url" type="url" placeholder="https://tiktok.com/@yourname" /></label>
          <label><span>YouTube profile URL</span><input name="youtube_url" type="url" placeholder="https://youtube.com/@yourname" /></label>
        </div>
        <div className="row">
          <label><span>Total followers <span className="req">*</span></span><input name="total_followers" type="number" min={0} step={1} required /></label>
          <label><span>Main audience country <span className="req">*</span></span><input name="audience_country" required /></label>
        </div>
        <label><span>Content category <span className="req">*</span></span>
          <select name="content_category" required defaultValue=""><option value="" disabled>Choose one</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label><span>Short introduction <span className="req">*</span></span><textarea name="introduction" required minLength={20} maxLength={1500} /></label>
        <label><span>Why do you want to collaborate with Anima Jewels? <span className="req">*</span></span><textarea name="why_collaborate" required minLength={20} maxLength={1500} /></label>
        <label><span>Create a password (10+ characters) <span className="req">*</span></span><input name="password" type="password" minLength={10} required autoComplete="new-password" /></label>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <input type="checkbox" name="terms" required style={{ width: 18, marginTop: 3 }} />
          <span>I agree to the <Link href="/terms" target="_blank">program terms</Link> and confirm the information above is accurate.</span>
        </label>
        <button className="btn" type="submit">Submit application</button>
        <p className="small muted">Already applied? <Link href="/login">Sign in</Link></p>
      </form>
    </AuthShell>
  );
}
