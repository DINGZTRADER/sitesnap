'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Camera, CheckCircle2, ChevronRight, CloudOff, MapPin, SlidersHorizontal, Users } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { BeforeAfter } from '@/components/before-after';
import { CaptureSheet } from '@/components/capture-sheet';
import { PhotoImage } from '@/components/photo-image';
import { filterPhotoRecords } from '@/lib/evidence';
import { team } from '@/lib/mock-data';
import { useWorkspace } from '@/components/workspace-provider';
import { getRuntimeMode } from '@/lib/runtime-mode';
import { getProjectPair } from '@/lib/project-view-model';
import type { PhotoRecord, Tag } from '@/types/domain';

type ProjectTab = 'photos' | 'comparison' | 'team';
const tags: Array<'All' | Tag> = ['All', 'Pre-Cover', 'Firestop Inspection', 'JCT Variation', 'Sub-base', 'Daily Progress'];
const tabs: Array<{ id: ProjectTab; label: string }> = [{ id: 'photos', label: 'Photos' }, { id: 'comparison', label: 'Before & After' }, { id: 'team', label: 'Team' }];
const appMode = getRuntimeMode({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { projects: workspaceProjects, loading: workspaceLoading, loadPhotoRecords, createPhotoRecord } = useWorkspace();
  const project = workspaceProjects.find(item => item.id === projectId);
  const [filter, setFilter] = useState<'All' | Tag>('All');
  const [activeTab, setActiveTab] = useState<ProjectTab>('photos');
  const [capture, setCapture] = useState(false);
  const [records, setRecords] = useState<PhotoRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  useEffect(() => {
    if (!project) return;
    let current = true;
    setRecordsLoading(true);
    setRecordsError(null);
    void loadPhotoRecords(projectId)
      .then(nextRecords => { if (current) setRecords(nextRecords); })
      .catch(() => { if (current) setRecordsError(appMode === 'cloud' ? 'We could not load the shared photo records.' : 'We could not load the local demo records.'); })
      .finally(() => { if (current) setRecordsLoading(false); });
    return () => { current = false; };
  }, [loadPhotoRecords, project, projectId]);

  useEffect(() => {
    setFilter('All');
    setActiveTab('photos');
  }, [projectId]);

  if (workspaceLoading && !project) return <AppShell><div className="px-5 py-10 text-sm text-navy/55">Loading project…</div></AppShell>;
  if (!project) return <AppShell><div className="px-5 py-10 text-sm text-navy/55">Project not found.</div></AppShell>;

  const pair = getProjectPair(records, projectId);
  const visibleRecords = filterPhotoRecords(records, filter);
  const recordCount = recordsLoading ? project.photoCount : records.length;

  const handleSaved = async (input: { file: File; note: string; tags: Tag[] }) => {
    const record = await createPhotoRecord({ projectId, ...input });
    setRecords(current => [record, ...current.filter(item => item.id !== record.id)]);
  };

  return <AppShell>
    <div className="min-h-screen px-5 py-6 pb-28 lg:px-10 lg:py-9">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-navy/50 transition hover:text-blue"><ArrowLeft size={15} /> Back to projects</Link>

        <div className="mt-6 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-blue/10 px-2.5 py-1.5 text-xs font-black text-blue">{project.code}</span><span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active project</span></div>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-navy sm:text-4xl">{project.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy/50"><span className="flex items-center gap-1.5"><MapPin size={15} />{project.address}</span><span>Client: {project.clientName}</span><span>{recordCount} photo records</span></div>
          </div>
          <button type="button" onClick={() => setCapture(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue px-5 py-3 text-sm font-black text-white shadow-md shadow-blue/20 transition hover:bg-blue/90 xl:w-auto"><Camera size={18} /> Add photo</button>
        </div>

        <div className="mt-7 flex flex-col gap-5 rounded-2xl bg-navy p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Project progress</p><p className="mt-2 text-2xl font-black">{project.progress}% complete</p><p className="mt-1 text-xs text-white/50">Last activity {project.updatedAt}</p></div>
          <div className="w-full max-w-xl"><div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-wider text-white/45"><span>Current stage</span><span>On track</span></div><div className="h-2.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-blue" style={{ width: project.progress + '%' }} /></div></div>
        </div>

        <div className="-mx-5 mt-7 flex gap-1 overflow-x-auto border-b border-line px-5 sm:mx-0 sm:px-0" role="tablist" aria-label="Project sections">
          {tabs.map(tab => <button type="button" key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={'whitespace-nowrap border-b-2 px-4 pb-3 text-sm font-black transition ' + (activeTab === tab.id ? 'border-blue text-blue' : 'border-transparent text-navy/45 hover:text-navy')}>{tab.label}</button>)}
        </div>

        {activeTab === 'photos' && <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]" role="tabpanel" aria-label="Project photos">
          <div className="min-w-0">
            {pair ? <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5"><div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue">Progress snapshot</p><h2 className="mt-2 text-lg font-black text-navy">Before & After</h2><p className="mt-1 text-xs text-navy/50">{pair.before.location} · selected from this project</p></div><button type="button" onClick={() => setActiveTab('comparison')} className="flex items-center gap-1 text-xs font-black text-blue">Open full view <ChevronRight size={15} /></button></div><BeforeAfter before={pair.before.image} after={pair.after.image} /></section> : <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-navy/50">No before / after pair has been added to this project yet.</div>}

            <section className="mt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue">Project timeline</p><h2 className="mt-2 text-xl font-black text-navy">Photo records</h2><p className="mt-1 text-sm text-navy/50">Filter the evidence captured on this project.</p></div><div className="flex items-center gap-2 overflow-x-auto pb-1"><SlidersHorizontal size={16} className="shrink-0 text-navy/40" />{tags.map(tag => <button type="button" key={tag} onClick={() => setFilter(tag)} aria-pressed={filter === tag} className={'whitespace-nowrap rounded-full border px-3 py-2 text-[11px] font-black transition ' + (filter === tag ? 'border-blue bg-blue text-white' : 'border-line bg-white text-navy/55 hover:border-blue/30 hover:text-blue')}>{tag}</button>)}</div></div>
              {recordsError && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-bold text-rose-800">{recordsError}<button type="button" onClick={() => { setRecordsError(null); setRecordsLoading(true); void loadPhotoRecords(projectId).then(setRecords).catch(() => setRecordsError('We could not load the photo records.')).finally(() => setRecordsLoading(false)); }} className="ml-3 underline">Try again</button></div>}
              {recordsLoading && <div className="mt-5 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-navy/50">{appMode === 'cloud' ? 'Syncing records…' : 'Loading local records…'}</div>}
              {!recordsLoading && !recordsError && <div className="mt-5 space-y-4">{visibleRecords.map(record => <article key={record.id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm"><div className="grid md:grid-cols-[240px_minmax(0,1fr)]"><div className="relative min-h-56 bg-navy/5"><PhotoImage src={record.image} alt="Site photo record" className="h-full w-full object-cover" sizes="(max-width: 768px) 100vw, 240px" /></div><div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-navy/40">{record.timestamp} · {record.location}</p><h3 className="mt-2 text-base font-black leading-6 text-navy">{record.note}</h3></div><CheckCircle2 size={19} className={'shrink-0 ' + (record.syncStatus === 'pending' ? 'text-amber-500' : 'text-emerald-600')} /></div><p className="mt-4 text-xs text-navy/50">Captured by <strong className="text-navy">{record.capturedBy}</strong>, {record.role}</p><div className="mt-4 flex flex-wrap gap-2">{record.tags.map(tag => <span key={tag} className="rounded-md bg-blue/8 px-2 py-1 text-[10px] font-black text-blue">{tag}</span>)}<span className="rounded-md bg-navy/5 px-2 py-1 text-[10px] font-bold text-navy/45">{record.syncStatus === 'synced' ? 'Synced record' : 'Saved locally · cloud sync not connected'}</span></div></div></div></article>)}</div>}
              {!recordsLoading && !recordsError && visibleRecords.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-line bg-white p-12 text-center text-sm text-navy/50">No records match this filter.</div>}
            </section>
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue">Project information</p><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-xs text-navy/40">Client</dt><dd className="mt-1 font-black text-navy">{project.clientName}</dd></div><div><dt className="text-xs text-navy/40">Site address</dt><dd className="mt-1 font-bold leading-5 text-navy">{project.address}</dd></div><div><dt className="text-xs text-navy/40">Records in this demo</dt><dd className="mt-1 font-black text-navy">{recordCount}</dd></div></dl></div>
            <div className="rounded-2xl border border-blue/15 bg-blue/5 p-5"><div className="flex items-center gap-2 text-blue"><CloudOff size={17} /><p className="text-xs font-black">{appMode === 'cloud' ? 'Cloud pilot storage' : 'Local demo storage'}</p></div><p className="mt-2 text-xs leading-5 text-navy/55">{appMode === 'cloud' ? 'Records upload to the private pilot workspace for the signed-in account. Offline sync and production retention are not enabled.' : 'New records are kept in this browser and remain after refresh. Cloud persistence and offline sync are not connected in demo mode.'}</p></div>
          </aside>
        </div>}

        {activeTab === 'comparison' && <section className="mt-6 max-w-5xl" role="tabpanel" aria-label="Before and after comparison">
          {pair ? <div className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6"><div className="mb-5"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue">Project comparison</p><h2 className="mt-2 text-2xl font-black text-navy">Track the change at a glance</h2><p className="mt-1 text-sm text-navy/50">{pair.before.location} · keyboard accessible divider</p></div><BeforeAfter before={pair.before.image} after={pair.after.image} /><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-canvas p-4"><p className="text-[10px] font-black uppercase tracking-wider text-navy/40">Before</p><p className="mt-2 text-sm font-bold text-navy">{pair.before.note}</p><p className="mt-2 text-xs text-navy/45">{pair.before.timestamp} · {pair.before.capturedBy}</p></div><div className="rounded-xl bg-blue/5 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-blue">After</p><p className="mt-2 text-sm font-bold text-navy">{pair.after.note}</p><p className="mt-2 text-xs text-navy/45">{pair.after.timestamp} · {pair.after.capturedBy}</p></div></div></div> : <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center text-sm text-navy/50">No before / after pair has been added to this project yet.</div>}
        </section>}

        {activeTab === 'team' && <section className="mt-6 max-w-3xl" role="tabpanel" aria-label="Project team"><div className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue">Project team</p><h2 className="mt-2 text-2xl font-black text-navy">People capturing the detail</h2><p className="mt-1 text-sm text-navy/50">Sample roles for this client demonstration.</p></div><div className="mt-6 divide-y divide-line">{team.map(member => <div key={member.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue/10 text-xs font-black text-blue">{member.initials}</span><div className="flex-1"><p className="text-sm font-black text-navy">{member.name}</p><p className="mt-0.5 text-xs text-navy/45">{member.role}</p></div><span className="flex items-center gap-2 text-xs font-bold text-navy/50"><span className={'h-2 w-2 rounded-full ' + (member.status === 'On site' ? 'bg-emerald-500' : 'bg-navy/20')} />{member.status}</span></div>)}</div><div className="mt-6 flex items-start gap-3 rounded-xl bg-canvas p-4 text-xs leading-5 text-navy/55"><Users size={16} className="mt-0.5 shrink-0 text-blue" />Team accounts and permissions are intentionally outside this lightweight prototype.</div></div></section>}
      </div>
    </div>
    {capture && <CaptureSheet projectId={project.id} cloudMode={appMode === 'cloud'} onClose={() => setCapture(false)} onSave={handleSaved} />}
  </AppShell>;
}
