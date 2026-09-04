'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { validateProjectInput, type CreateProjectInput } from '@/lib/project-input';
import { useWorkspace } from '@/components/workspace-provider';
import { useRouter } from 'next/navigation';

const emptyInput: CreateProjectInput = { name: '', address: '', clientName: '', code: '' };

export function ProjectForm() {
  const router = useRouter();
  const { createProject } = useWorkspace();
  const [input, setInput] = useState(emptyInput);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const setField = (field: keyof CreateProjectInput, value: string) => {
    setInput(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: '' }));
    setSubmitError(null);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateProjectInput(input);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setSaving(true);
    setSubmitError(null);
    try {
      const project = await createProject(result.value);
      router.push(`/projects/${project.id}`);
    } catch {
      setSubmitError('The site could not be saved. Check your connection and try again.');
      setSaving(false);
    }
  }

  const canSave = Boolean(input.name.trim() && input.address.trim() && !saving);

  return <section className="max-w-2xl rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-8">
    <div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue/10 text-blue"><Save size={19} /></span><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue">New site</p><h1 className="mt-2 text-2xl font-black tracking-tight text-navy">Create a project</h1><p className="mt-1 text-sm leading-6 text-navy/50">Set up the site once, then capture every visit against the right record.</p></div></div>
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div><label htmlFor="project-name" className="text-xs font-black text-navy">Site name <span className="text-blue">*</span></label><input id="project-name" value={input.name} onChange={event => setField('name', event.target.value)} placeholder="e.g. Mews Redevelopment · Unit 4B" className="mt-2 w-full rounded-xl border border-line px-3.5 py-3 text-sm font-bold outline-none transition placeholder:text-navy/25 focus:border-blue focus:ring-4 focus:ring-blue/10" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'project-name-error' : undefined} />{errors.name && <p id="project-name-error" role="alert" className="mt-1.5 text-xs font-bold text-rose-700">{errors.name}</p>}</div>
      <div><label htmlFor="project-address" className="text-xs font-black text-navy">Site address <span className="text-blue">*</span></label><input id="project-address" value={input.address} onChange={event => setField('address', event.target.value)} placeholder="Street, town/city, postcode" className="mt-2 w-full rounded-xl border border-line px-3.5 py-3 text-sm font-bold outline-none transition placeholder:text-navy/25 focus:border-blue focus:ring-4 focus:ring-blue/10" aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? 'project-address-error' : undefined} />{errors.address && <p id="project-address-error" role="alert" className="mt-1.5 text-xs font-bold text-rose-700">{errors.address}</p>}</div>
      <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="project-client" className="text-xs font-black text-navy">Client <span className="font-normal text-navy/40">(optional)</span></label><input id="project-client" value={input.clientName} onChange={event => setField('clientName', event.target.value)} placeholder="e.g. Derwent London" className="mt-2 w-full rounded-xl border border-line px-3.5 py-3 text-sm font-bold outline-none transition placeholder:text-navy/25 focus:border-blue focus:ring-4 focus:ring-blue/10" /></div><div><label htmlFor="project-code" className="text-xs font-black text-navy">Project code <span className="font-normal text-navy/40">(optional)</span></label><input id="project-code" value={input.code} onChange={event => setField('code', event.target.value)} placeholder="Auto-created if blank" className="mt-2 w-full rounded-xl border border-line px-3.5 py-3 text-sm font-bold uppercase outline-none transition placeholder:normal-case placeholder:text-navy/25 focus:border-blue focus:ring-4 focus:ring-blue/10" /></div></div>
      {submitError && <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-3 text-xs font-bold leading-5 text-rose-800">{submitError}</p>}
      <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-between"><Link href="/projects" className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-xs font-black text-navy/60 transition hover:border-blue/30 hover:text-blue"><ArrowLeft size={15} /> Cancel</Link><button type="submit" disabled={!canSave} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue px-5 py-3 text-xs font-black text-white shadow-md shadow-blue/20 transition hover:bg-blue/90 disabled:cursor-not-allowed disabled:opacity-45"><Save size={15} />{saving ? 'Saving site…' : 'Save site'}</button></div>
    </form>
  </section>;
}
