export type EmailConfirmationOutcome = 'authenticated' | 'failed' | 'missing-token';

type VerifyEmailToken = (tokenHash: string) => Promise<{ error: unknown | null }>;

export async function resolveEmailConfirmationOutcome(
  tokenHash: string | null,
  verifyEmailToken: VerifyEmailToken,
): Promise<EmailConfirmationOutcome> {
  if (!tokenHash) return 'missing-token';

  const { error } = await verifyEmailToken(tokenHash);
  return error ? 'failed' : 'authenticated';
}
