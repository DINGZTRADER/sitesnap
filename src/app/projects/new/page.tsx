'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { ProjectForm } from '@/components/project-form';

export default function NewProjectPage() {
  return <AppShell><div className="min-h-screen px-5 py-6 pb-28 lg:px-10 lg:py-9"><div className="mx-auto max-w-7xl"><Link href="/projects" className="inline-flex items-center gap-2 text-xs font-black text-navy/50 transition hover:text-blue"><ArrowLeft size={15} /> Back to projects</Link><div className="mt-6"><ProjectForm /></div></div></div></AppShell>;
}
