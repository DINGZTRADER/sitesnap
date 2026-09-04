export type AuthCallbackOutcome = 'authenticated' | 'failed' | 'missing-code';

type ExchangeAuthCode = (code: string) => Promise<{ error: unknown | null }>;

export async function resolveAuthCallbackOutcome(
  code: string | null,
  exchangeAuthCode: ExchangeAuthCode,
): Promise<AuthCallbackOutcome> {
  if (!code) return 'missing-code';

  const { error } = await exchangeAuthCode(code);
  return error ? 'failed' : 'authenticated';
}
