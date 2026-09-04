export type RuntimeMode = 'demo' | 'cloud';

export type PublicSupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
};

export function isCloudConfigured(env: PublicSupabaseEnv): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL?.trim() && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim());
}

export function getRuntimeMode(env: PublicSupabaseEnv): RuntimeMode {
  return isCloudConfigured(env) ? 'cloud' : 'demo';
}
