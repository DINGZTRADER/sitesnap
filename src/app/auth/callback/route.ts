import { NextRequest, NextResponse } from 'next/server';
import { ensureWorkspaceForUser, getSafeNextPath } from '@/lib/auth';
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
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw userError ?? new Error('User session is unavailable.');

    await ensureWorkspaceForUser(userData.user.id);
    return NextResponse.redirect(redirectUrl);
  } catch {
    redirectUrl.pathname = '/login';
    redirectUrl.search = '?error=The sign-in link has expired. Please request a new one.';
    return NextResponse.redirect(redirectUrl);
  }
}
