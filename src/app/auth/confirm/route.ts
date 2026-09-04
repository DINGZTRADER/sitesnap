import { NextRequest, NextResponse } from 'next/server';
import { resolveEmailConfirmationOutcome } from '@/lib/auth-confirmation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const redirectUrl = new URL('/', request.url);

  if (!tokenHash) {
    redirectUrl.pathname = '/login';
    redirectUrl.search = '?error=The sign-in link is missing or invalid.';
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const outcome = await resolveEmailConfirmationOutcome(
      tokenHash,
      (hash) => supabase.auth.verifyOtp({ token_hash: hash, type: 'email' }),
    );

    if (outcome !== 'authenticated') throw new Error('Unable to verify the email token.');

    return NextResponse.redirect(redirectUrl);
  } catch {
    redirectUrl.pathname = '/login';
    redirectUrl.search = '?error=The sign-in link has expired. Please request a new one.';
    return NextResponse.redirect(redirectUrl);
  }
}
