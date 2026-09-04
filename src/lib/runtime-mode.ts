export type RuntimeMode = 'demo' | 'cloud';

type PublicSupabaseEnv = Pick<NodeJS.ProcessEnv, 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'>;

export function isCloudConfigured(env: PublicSupabaseEnv): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL?.trim() && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim());
}

export function getRuntimeMode(env: PublicSupabaseEnv): RuntimeMode {
  return isCloudConfigured(env) ? 'cloud' : 'demo';
}
