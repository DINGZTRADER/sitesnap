'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { createProject as createProjectRecord, listProjects } from '@/lib/projects-repository';
import { createPhotoRecord as createPhotoRecordRecord, listPhotoRecords as listPhotoRecordsRecord } from '@/lib/photo-repository';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { getRuntimeMode } from '@/lib/runtime-mode';
import type { RepositoryContext } from '@/lib/repository-context';
import type { PhotoRecord, Project, Tag } from '@/types/domain';
import { projects as demoProjects } from '@/lib/mock-data';

type WorkspaceValue = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  createProject: (input: { name: string; address: string; clientName: string; code: string }) => Promise<Project>;
  loadPhotoRecords: (projectId: string) => Promise<PhotoRecord[]>;
  createPhotoRecord: (input: { projectId: string; file: File; note: string; tags: Tag[] }) => Promise<PhotoRecord>;
};

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

const mode = getRuntimeMode({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

async function createRepositoryContext(): Promise<RepositoryContext> {
  if (mode === 'demo') return { mode, workspaceId: null, userId: null, supabase: null };

  const supabase = createSupabaseBrowserClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Sign in to load your shared SiteSnap workspace.');

  const user = userData.user;
  const { data: membership, error: membershipError } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (membership?.workspace_id) return { mode, workspaceId: membership.workspace_id, userId: user.id, supabase };

  const displayName = typeof user.user_metadata?.display_name === 'string' && user.user_metadata.display_name.trim()
    ? user.user_metadata.display_name.trim()
    : user.email?.split('@')[0] || 'Site Manager';
  const { error: profileError } = await supabase.from('profiles').upsert({ id: user.id, display_name: displayName, role: 'Site Manager' });
  if (profileError) throw profileError;

  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({ name: 'My SiteSnap workspace', owner_id: user.id })
    .select('id')
    .single();
  if (workspaceError || !workspace) throw workspaceError ?? new Error('Workspace creation failed.');

  const { error: ownerError } = await supabase.from('workspace_members').insert({ workspace_id: workspace.id, user_id: user.id, role: 'owner' });
  if (ownerError) throw ownerError;

  return { mode, workspaceId: workspace.id, userId: user.id, supabase };
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [repositoryContext, setRepositoryContext] = useState<RepositoryContext | null>(null);
  const [projects, setProjects] = useState<Project[]>(mode === 'demo' ? demoProjects : []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = useCallback(async () => {
    setError(null);
    setLoading(true);

    if (mode === 'demo') {
      const context = repositoryContext ?? { mode: 'demo', workspaceId: null, userId: null, supabase: null } satisfies RepositoryContext;
      setRepositoryContext(context);
      try {
        setProjects(await listProjects(context));
      } catch {
        setError('We could not load the local demo workspace.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const context = repositoryContext ?? await createRepositoryContext();
      const nextProjects = await listProjects(context);
      setRepositoryContext(context);
      setProjects(nextProjects);
    } catch {
      setError(mode === 'cloud' ? 'We could not load the shared workspace. Check your connection and try again.' : 'We could not load the local demo workspace.');
    } finally {
      setLoading(false);
    }
  }, [repositoryContext]);

  const getRepositoryContext = useCallback(async (): Promise<RepositoryContext> => {
    if (repositoryContext) return repositoryContext;
    const context = await createRepositoryContext();
    setRepositoryContext(context);
    return context;
  }, [repositoryContext]);

  useEffect(() => {
    if (pathname === '/login' || pathname.startsWith('/auth')) {
      setLoading(false);
      return;
    }
    void refreshProjects();
  }, [pathname, refreshProjects]);

  const createProject = useCallback(async (input: { name: string; address: string; clientName: string; code: string }) => {
    const context = await getRepositoryContext();
    const project = await createProjectRecord(input, context);
    setRepositoryContext(context);
    setProjects(current => [project, ...current.filter(item => item.id !== project.id)]);
    return project;
  }, [getRepositoryContext]);

  const loadPhotoRecords = useCallback(async (projectId: string) => {
    return listPhotoRecordsRecord(await getRepositoryContext(), projectId);
  }, [getRepositoryContext]);

  const createPhotoRecord = useCallback(async (input: { projectId: string; file: File; note: string; tags: Tag[] }) => {
    const record = await createPhotoRecordRecord(await getRepositoryContext(), input);
    setProjects(current => current.map(project => project.id === input.projectId
      ? { ...project, photoCount: project.photoCount + 1, updatedAt: 'Just now' }
      : project));
    return record;
  }, [getRepositoryContext]);

  const value = useMemo(() => ({ projects, loading, error, refreshProjects, createProject, loadPhotoRecords, createPhotoRecord }), [createPhotoRecord, createProject, error, loadPhotoRecords, loading, projects, refreshProjects]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceValue {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('useWorkspace must be used inside WorkspaceProvider.');
  return value;
}
