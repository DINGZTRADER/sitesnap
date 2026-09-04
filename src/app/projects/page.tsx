'use client';

import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { AppShell, SiteCard } from '@/components/app-shell';
import { useWorkspace } from '@/components/workspace-provider';

export default function ProjectsPage() {
  const { projects, loading, error, refreshProjects } = useWorkspace();
  const activeProjects = projects.filter(project => project.status === 'active');

  return <AppShell><div className="min-h-screen px-5 py-6 pb-28 lg:px-10 lg:py-9"><div className="mx-auto max-w-7xl"><Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-navy/50 transition hover:text-blue"><ArrowLeft size={15} /> Back to overview</Link><div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue">Workspace</p><h1 className="mt-2 text-3xl font-black tracking-tight text-navy">Projects and sites</h1><p className="mt-2 text-sm leading-6 text-navy/50">Create a site on your phone or desktop, then keep every photo in the same record.</p></div><Link href="/projects/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue px-4 py-3 text-xs font-black text-white shadow-md shadow-blue/20 transition hover:bg-blue/90"><Plus size={16} /> New project</Link></div>{error && <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-bold text-rose-800">{error}<button type="button" onClick={() => void refreshProjects()} className="ml-3 underline">Try again</button></div>}{loading && <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-8 text-sm text-navy/50">Loading your workspace…</div>}{!loading && !error && activeProjects.length === 0 && <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-navy/55">No active sites yet. Create your first site to get started.</div>}{!loading && !error && activeProjects.length > 0 && <div className="mt-6 grid gap-4 md:grid-cols-3">{activeProjects.map(project => <SiteCard key={project.id} p={project} />)}</div>}</div></div></AppShell>;
}
