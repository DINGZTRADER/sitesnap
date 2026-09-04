export function createGoogleSignInRequest(origin: string) {
  return {
    provider: 'google' as const,
    options: { redirectTo: new URL('/auth/callback', origin).toString() },
  };
}
