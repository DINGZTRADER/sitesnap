'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { getMagicLinkRedirectUrl } from '@/lib/auth-redirect';
import { createGoogleSignInRequest } from '@/lib/google-auth';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { getRuntimeMode } from '@/lib/runtime-mode';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cloudConfigured = getRuntimeMode({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  }) === 'cloud';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Enter the email address you will use on both phone and PC.');
      return;
    }

    if (!cloudConfigured) {
      setError('Cloud sign-in is not configured in this environment.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: getMagicLinkRedirectUrl(window.location.origin),
        },
      });

      if (signInError) throw signInError;
      setStatus('Check your email for a secure SiteSnap sign-in link.');
    } catch {
      setError('We could not send the sign-in link. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setStatus(null);

    if (!cloudConfigured) {
      setError('Cloud sign-in is not configured in this environment.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth(
        createGoogleSignInRequest(window.location.origin),
      );

      if (signInError) throw signInError;
    } catch {
      setError('We could not start Google sign-in. Please try again.');
      setLoading(false);
    }
  }

  return <main className="min-h-screen bg-canvas px-5 py-8 text-navy sm:grid sm:place-items-center">
    <section className="mx-auto w-full max-w-md">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-navy/50 transition hover:text-blue"><ArrowLeft size={15} /> Back to SiteSnap</Link>
      <div className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-xl shadow-navy/5 sm:p-8">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue text-lg font-black text-white">S</span><div><p className="text-xl font-black tracking-tight">Sign in to SiteSnap</p><p className="text-xs text-navy/45">Your construction photo workspace</p></div></div>
        <div className="mt-8 rounded-2xl bg-blue/5 p-4"><div className="flex items-start gap-3"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-blue" /><p className="text-xs leading-5 text-navy/60">Use the same email address on your phone and PC to see the same sites and photo records.</p></div></div>
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div><label htmlFor="email" className="text-xs font-black text-navy">Email address</label><div className="relative mt-2"><Mail size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" /><input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@company.co.uk" className="w-full rounded-xl border border-line bg-white py-3 pl-10 pr-3 text-sm font-bold outline-none transition placeholder:text-navy/25 focus:border-blue focus:ring-4 focus:ring-blue/10" /></div></div>
          <button type="submit" disabled={loading || !cloudConfigured} className="w-full rounded-xl bg-blue px-4 py-3.5 text-sm font-black text-white shadow-md shadow-blue/20 transition hover:bg-blue/90 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Sending sign-in link…' : 'Send sign-in link'}</button>
        </form>
        <div className="my-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.14em] text-navy/35"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
        <button type="button" onClick={() => void handleGoogleSignIn()} disabled={loading || !cloudConfigured} className="flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 text-sm font-black text-navy shadow-sm transition hover:border-blue/30 hover:bg-blue/5 disabled:cursor-not-allowed disabled:opacity-50"><span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-navy text-[11px] font-black text-white">G</span>{loading ? 'Opening Google…' : 'Continue with Google'}</button>
        {status && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-bold leading-5 text-emerald-800">{status}</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-bold leading-5 text-rose-800">{error}</p>}
        {!cloudConfigured && <p className="mt-4 text-center text-[11px] font-bold leading-5 text-navy/45">This local build is running in demo mode. Cloud sign-in will appear when the two public Supabase settings are configured.</p>}
        <p className="mt-6 text-center text-[11px] font-bold text-navy/45"><Link className="hover:text-blue hover:underline" href="/privacy">Privacy</Link><span className="px-2">·</span><Link className="hover:text-blue hover:underline" href="/terms">Pilot terms</Link></p>
      </div>
    </section>
  </main>;
}
