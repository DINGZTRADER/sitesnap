import { NextRequest, NextResponse } from 'next/server';
import { getSafeNextPath } from '@/lib/auth';
import { resolveAuthCallbackOutcome } from '@/lib/auth-callback';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = getSafeNextPath(request.nextUrl.searchParams.get('next'));
  const redirectUrl = new URL(next, request.url);

  if (!code) {
    redirectUrl.pathname = '/login';
    redirectUrl.search = '?error=The sign-in link is missing or invalid.';
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const outcome = await resolveAuthCallbackOutcome(
      code,
      (authCode) => supabase.auth.exchangeCodeForSession(authCode),
    );
    if (outcome !== 'authenticated') throw new Error('Unable to exchange the sign-in code.');

    return NextResponse.redirect(redirectUrl);
  } catch {
    redirectUrl.pathname = '/login';
    redirectUrl.search = '?error=The sign-in link has expired. Please request a new one.';
    return NextResponse.redirect(redirectUrl);
  }
}
