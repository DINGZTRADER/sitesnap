export function getMagicLinkRedirectUrl(origin: string): string {
  return new URL('/auth/callback', origin).toString();
}
