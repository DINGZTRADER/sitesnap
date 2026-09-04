import type { SupabaseClient } from '@supabase/supabase-js';
import type { RuntimeMode } from '@/lib/runtime-mode';
import type { Database } from '@/types/database';

export type RepositoryContext = {
  mode: RuntimeMode;
  workspaceId: string | null;
  userId: string | null;
  supabase: SupabaseClient<Database> | null;
};
