export type AuthUserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function hasSupabaseConfig(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim());
}

export function getSafeNextPath(path: string | null | undefined): string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return '/';

  try {
    const parsed = new URL(path, 'http://sitesnap.local');
    return parsed.origin === 'http://sitesnap.local' ? path : '/';
  } catch {
    return '/';
  }
}

export function getDisplayName(user: AuthUserLike | null | undefined): string {
  const metadata = user?.user_metadata;
  const metadataName = ['display_name', 'full_name', 'name']
    .map(key => metadata?.[key])
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0);

  if (metadataName) return metadataName.trim();

  const emailLocalPart = user?.email?.split('@')[0]?.trim();
  return emailLocalPart || 'Site Manager';
}

export async function getCurrentUser() {
  if (!hasSupabaseConfig()) return null;

  const { createSupabaseServerClient } = await import('@/lib/supabase/server');
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}

export async function ensureWorkspaceForUser(userId: string): Promise<string> {
  if (!hasSupabaseConfig()) {
    throw new Error('A hosted Supabase workspace is not configured.');
  }

  const { createSupabaseServerClient } = await import('@/lib/supabase/server');
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user || authData.user.id !== userId) {
    throw new Error('Your sign-in session could not be verified.');
  }

  const user = authData.user;
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    display_name: getDisplayName(user),
    role: 'Site Manager',
  });

  if (profileError) throw profileError;

  const { data: membership, error: membershipError } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (membership?.workspace_id) return membership.workspace_id;

  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({ name: 'My SiteSnap workspace', owner_id: user.id })
    .select('id')
    .single();

  if (workspaceError || !workspace) throw workspaceError ?? new Error('Workspace creation failed.');

  const { error: ownerError } = await supabase.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: 'owner',
  });

  if (ownerError) {
    await supabase.from('workspaces').delete().eq('id', workspace.id);
    throw ownerError;
  }

  return workspace.id;
}
