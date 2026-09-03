'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Activity, ArrowUpRight, Bell, Camera, CheckCircle2, ChevronRight, CloudOff, FolderKanban, LayoutDashboard, Plus, Search, Users } from 'lucide-react';
import { projects, photos, team } from '@/lib/mock-data';
import { PricingPanel } from '@/components/pricing-panel';
import { PhotoImage } from '@/components/photo-image';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentProjectId = pathname.startsWith('/projects/') ? pathname.split('/')[2] : projects[0].id;
  const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard, active: pathname === '/' },
    { href: '/#projects', label: 'Projects', icon: FolderKanban, active: pathname.startsWith('/projects/') },
    { href: '/#team', label: 'Team', icon: Users, active: false },
  ];

  return (
    <div className="min-h-screen bg-canvas text-navy">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col bg-navy px-4 py-5 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3 px-3 py-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue text-lg font-black shadow-lg shadow-blue/25">S</span>
          <span className="text-xl font-black tracking-tight">SiteSnap</span>
        </Link>
        <div className="mt-10 px-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Workspace</p>
          <p className="mt-2 truncate text-sm font-bold text-white/80">Wacha Build Co.</p>
        </div>
        <nav className="mt-5 space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            return <Link key={item.label} href={item.href} className={'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ' + (item.active ? 'bg-white text-navy shadow-lg shadow-black/10' : 'text-white/60 hover:bg-white/10 hover:text-white')}><Icon size={18} />{item.label}</Link>;
          })}
        </nav>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-white/80">Demo workspace</p>
            <CloudOff size={15} className="text-lime" />
          </div>
          <p className="mt-2 text-xs leading-5 text-white/50">Local records only. Cloud sync is not connected.</p>
          <span className="mt-3 inline-flex rounded-full bg-lime/15 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-lime">Prototype</span>
        </div>
        <div className="mt-auto rounded-2xl bg-blue p-4 shadow-lg shadow-black/15">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Standard company</p>
          <p className="mt-2 text-2xl font-black">£179<span className="text-xs font-normal text-white/70"> / month</span></p>
          <p className="mt-2 text-xs leading-5 text-white/75">Professional records without enterprise pricing.</p>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[252px]">
        <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between border-b border-line bg-white/90 px-5 backdrop-blur lg:px-10">
          <div className="flex items-center gap-3">
            <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl bg-navy text-sm font-black text-white lg:hidden">S</Link>
            <div>
              <p className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-navy/40 sm:block">SiteSnap workspace</p>
              <p className="text-sm font-black text-navy">{pathname.startsWith('/projects/') ? 'Project workspace' : 'Overview'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href={'/projects/' + currentProjectId} className="hidden items-center gap-2 rounded-xl bg-blue px-3.5 py-2.5 text-xs font-black text-white shadow-md shadow-blue/15 transition hover:bg-blue/90 sm:flex"><Plus size={16} /> Add photo</Link>
            <button type="button" aria-label="Search" className="hidden rounded-xl border border-line p-2.5 text-navy/55 transition hover:border-blue/30 hover:text-blue sm:block"><Search size={17} /></button>
            <button type="button" aria-label="Notifications" className="rounded-xl border border-line p-2.5 text-navy/55 transition hover:border-blue/30 hover:text-blue"><Bell size={17} /></button>
            <div className="flex items-center gap-2 border-l border-line pl-2 sm:pl-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f4d35e] text-xs font-black text-navy">LC</span>
              <div className="hidden md:block">
                <p className="text-xs font-black">Liam Cooper</p>
                <p className="text-[10px] text-navy/45">Site Manager</p>
              </div>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-line bg-white/95 px-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur lg:hidden">
        {navItems.map(item => {
          const Icon = item.icon;
          return <Link key={item.label} href={item.href} className={'grid min-w-16 place-items-center rounded-xl px-3 py-2 text-[10px] font-black ' + (item.active ? 'bg-blue/10 text-blue' : 'text-navy/45')}><Icon size={19} /><span className="mt-1">{item.label}</span></Link>;
        })}
      </nav>
    </div>
  );
}

export function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-line bg-white p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-navy/40">{label}</p><p className="mt-3 text-3xl font-black tracking-tight text-navy">{value}</p><p className="mt-1 text-xs text-navy/50">{detail}</p></div>;
}

export function SiteCard({ p }: { p: typeof projects[number] }) {
  return <Link href={'/projects/' + p.id} className="group rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue/25 hover:shadow-xl hover:shadow-navy/5">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2.5"><span className="grid h-11 w-11 place-items-center rounded-xl text-sm font-black text-navy" style={{ background: p.accent }}>{p.code.slice(0, 2)}</span><div><p className="text-xs font-black text-navy/45">{p.code}</p><p className="mt-0.5 text-xs font-bold text-navy/65">{p.clientName}</p></div></div>
      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Active</span>
    </div>
    <h3 className="mt-5 line-clamp-2 text-base font-black leading-6 text-navy">{p.name}</h3>
    <p className="mt-1 flex items-start gap-1 text-xs leading-5 text-navy/50"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-navy/25" />{p.address}</p>
    <div className="mt-5 flex items-center justify-between text-xs"><span className="font-black text-navy">{p.photoCount} records</span><span className="text-navy/40">Updated {p.updatedAt}</span></div>
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy/8"><div className="h-full rounded-full bg-blue transition-all group-hover:bg-navy" style={{ width: p.progress + '%' }} /></div>
    <div className="mt-4 flex items-center justify-between text-xs font-black text-blue"><span>{p.progress}% complete</span><ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div>
  </Link>;
}

export function Dashboard() {
  const [pricing, setPricing] = useState(false);
  return <AppShell>
    <div className="grain min-h-[calc(100vh-76px)] px-5 py-6 pb-28 lg:px-10 lg:py-9">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-black uppercase tracking-[0.16em] text-blue">Thursday · 3 September 2026</span><span className="rounded-full bg-blue/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue">Local demo</span></div><h1 className="mt-3 text-3xl font-black tracking-tight text-navy sm:text-4xl">Good morning, Liam.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-navy/55">Keep every site detail in one clear record, ready when your client or clerk of works needs it.</p></div>
          <div className="flex gap-2"><button type="button" onClick={() => setPricing(true)} className="rounded-xl border border-line bg-white px-4 py-3 text-xs font-black text-navy shadow-sm transition hover:border-blue/30 hover:text-blue">View pricing</button><Link href={'/projects/' + projects[0].id} className="flex items-center justify-center gap-2 rounded-xl bg-blue px-4 py-3 text-xs font-black text-white shadow-md shadow-blue/20 transition hover:bg-blue/90"><Camera size={16} /> Add a site photo</Link></div>
        </div>

        <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-blue/15 bg-gradient-to-r from-blue/10 via-white to-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-blue shadow-sm"><CloudOff size={19} /></span><div><p className="text-sm font-black text-navy">Demo workspace · local only</p><p className="mt-1 text-xs leading-5 text-navy/55">Photos and notes are saved in this browser for the demonstration. Cloud sync is not connected.</p></div></div>
          <span className="self-start rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue shadow-sm sm:self-center">Prototype mode</span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3"><Stat label="Active projects" value="3" detail="All sites reporting" /><Stat label="Photo records" value="101" detail="Across your active sites" /><Stat label="Team on site" value="3 / 4" detail="One member away today" /></div>

        <section className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue">Get started</p><h2 className="mt-2 text-xl font-black text-navy">Build your first clear record</h2><p className="mt-1 text-sm text-navy/50">A simple routine for every visit to site.</p></div><div className="text-left sm:text-right"><p className="text-xs font-black text-navy">2 of 3 steps</p><div className="mt-2 h-2 w-36 rounded-full bg-navy/8"><div className="h-full w-2/3 rounded-full bg-blue" /></div></div></div>
          <div className="mt-6 grid gap-3 md:grid-cols-3"><div className="flex items-center gap-3 rounded-xl bg-blue/5 p-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-blue text-xs font-black text-white">1</span><div><p className="text-xs font-black text-navy">Open a project</p><p className="mt-0.5 text-[11px] text-navy/50">Your team starts here.</p></div><CheckCircle2 size={16} className="ml-auto text-blue" /></div><div className="flex items-center gap-3 rounded-xl bg-blue/5 p-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-blue text-xs font-black text-white">2</span><div><p className="text-xs font-black text-navy">Add a site photo</p><p className="mt-0.5 text-[11px] text-navy/50">Capture detail in seconds.</p></div><CheckCircle2 size={16} className="ml-auto text-blue" /></div><div className="flex items-center gap-3 rounded-xl border border-dashed border-line p-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-canvas text-xs font-black text-navy/50">3</span><div><p className="text-xs font-black text-navy/65">Share the record</p><p className="mt-0.5 text-[11px] text-navy/45">Client handover is Phase 2.</p></div><span className="ml-auto rounded-full bg-canvas px-2 py-1 text-[10px] font-black text-navy/40">Later</span></div></div>
        </section>

        <section id="projects" className="mt-9">
          <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue">Your work</p><h2 className="mt-2 text-xl font-black text-navy">Active projects</h2><p className="mt-1 text-sm text-navy/50">Select a project to view its photo timeline.</p></div><span className="text-xs font-black text-navy/40">3 active</span></div>
          <div className="grid gap-4 md:grid-cols-3">{projects.map(project => <SiteCard key={project.id} p={project} />)}</div>
        </section>

        <section className="mt-9 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue">Live feed</p><h2 className="mt-2 text-xl font-black text-navy">Recent photo records</h2><p className="mt-1 text-sm text-navy/50">The latest evidence from across your sites.</p></div><Activity size={19} className="text-blue" /></div><div className="mt-5 space-y-2">{photos.slice(0, 3).map(photo => <Link href={'/projects/' + photo.projectId} key={photo.id} className="flex gap-3 rounded-xl p-2 transition hover:bg-blue/5"><PhotoImage src={photo.image} alt="Site photo record" className="h-16 w-20 shrink-0 rounded-xl object-cover" sizes="80px" /><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-bold leading-5 text-navy">{photo.note}</p><p className="mt-1 text-xs text-navy/45">{photo.capturedBy} · {photo.timestamp}</p></div><ChevronRight size={16} className="mt-1 shrink-0 text-navy/25" /></Link>)}</div></div>
          <div id="team" className="rounded-2xl bg-navy p-5 text-white shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-lime">People on site</p><h2 className="mt-2 text-xl font-black">Your team</h2><p className="mt-1 text-sm text-white/50">Who is capturing today.</p></div><Users size={20} className="text-lime" /></div><div className="mt-6 space-y-4">{team.map(member => <div key={member.id} className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-[10px] font-black">{member.initials}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{member.name}</p><p className="mt-0.5 text-[11px] text-white/45">{member.role}</p></div><span className={'h-2 w-2 rounded-full ' + (member.status === 'On site' ? 'bg-lime' : 'bg-white/25')} /></div>)}</div><div className="mt-7 border-t border-white/10 pt-4"><p className="text-xs leading-5 text-white/50">Members, roles and live status are sample data in this prototype.</p></div></div>
        </section>
      </div>
    </div>
    {pricing && <PricingPanel onClose={() => setPricing(false)} />}
  </AppShell>;
}
