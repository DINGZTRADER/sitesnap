'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Check, ImagePlus, LoaderCircle, X } from 'lucide-react';
import { canSaveCapture } from '@/lib/evidence';
import type { PhotoRecord, Tag } from '@/types/domain';

const availableTags: Tag[] = ['Daily Progress', 'Pre-Cover', 'Firestop Inspection', 'JCT Variation', 'Snagging Defect'];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Image could not be read.'));
    reader.onerror = () => reject(reader.error ?? new Error('Image could not be read.'));
    reader.readAsDataURL(file);
  });
}

export function CaptureSheet({ projectId, onClose, onSaved }: { projectId: string; onClose: () => void; onSaved: (record: PhotoRecord) => void | Promise<void> }) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.clearTimeout(focusTimer);
    };
  }, [onClose]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [file]);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }
    if (!canSaveCapture(selectedFile)) {
      setFile(null);
      setError('Please choose an image file such as JPG, PNG, or HEIC.');
      return;
    }
    setError('');
    setFile(selectedFile);
  };

  const save = async () => {
    if (!canSaveCapture(file) || !file) return;
    setSaving(true);
    setError('');
    try {
      const image = await readFileAsDataUrl(file);
      await onSaved({
        id: 'local-' + Date.now(),
        projectId,
        image,
        timestamp: 'Just now',
        capturedBy: 'Liam Cooper',
        role: 'Site Manager',
        location: 'New local record',
        tags,
        note: note.trim() || 'Photo added from the field.',
        syncStatus: 'pending',
      });
      onClose();
    } catch {
      setError('This image could not be saved locally. Please try another photo.');
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl" role="dialog" aria-modal="true" aria-labelledby="capture-title">
        <div className="flex items-start justify-between border-b border-line px-5 py-5 sm:px-7">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue"><Camera size={14} /> New site record</p>
            <h2 id="capture-title" className="mt-2 text-2xl font-black tracking-tight text-navy">Add a site photo</h2>
            <p className="mt-1 text-sm text-navy/55">Capture the detail now. Add context when you have a moment.</p>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close add photo dialog" className="rounded-full border border-line p-2 text-navy/60 transition hover:bg-canvas">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
          <label htmlFor="capture-photo" className="group relative flex min-h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-blue/25 bg-blue/5 px-4 py-7 text-center transition hover:border-blue hover:bg-blue/10">
            {preview ? (
              <>
                <img src={preview} alt="Selected site photo preview" className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute inset-x-4 bottom-4 rounded-xl bg-navy/80 px-3 py-2 text-left text-xs font-bold text-white">{file?.name}</span>
              </>
            ) : (
              <>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-blue shadow-sm"><ImagePlus size={25} /></span>
                <span className="mt-3 text-sm font-black text-navy">Take or choose a photo</span>
                <span className="mt-1 text-xs text-navy/50">JPG, PNG or HEIC · operator and time added automatically</span>
              </>
            )}
            <input id="capture-photo" className="sr-only" type="file" accept="image/*" capture="environment" onChange={event => handleFileChange(event.target.files?.[0] ?? null)} />
          </label>

          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700" role="alert">{error}</p>}

          <label htmlFor="site-note" className="block text-sm font-black text-navy">
            Site note <span className="font-normal text-navy/45">(optional)</span>
            <textarea id="site-note" value={note} onChange={event => setNote(event.target.value)} placeholder="What should the team know?" className="mt-2 min-h-24 w-full resize-none rounded-xl border border-line bg-white p-3 text-sm font-normal text-navy outline-none placeholder:text-navy/35 focus:border-blue" />
          </label>

          <div>
            <p className="text-sm font-black text-navy">Add a tag <span className="font-normal text-navy/45">(optional)</span></p>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableTags.map(tag => {
                const selected = tags.includes(tag);
                return <button type="button" key={tag} aria-pressed={selected} onClick={() => setTags(current => selected ? current.filter(item => item !== tag) : [...current, tag])} className={'rounded-full border px-3 py-2 text-xs font-bold transition ' + (selected ? 'border-blue bg-blue text-white' : 'border-line bg-white text-navy/60 hover:border-blue/40 hover:text-blue')}>{tag}</button>;
              })}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-[#eef7ff] p-4 text-sm text-navy/65">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-blue"><Check size={15} /></span>
            <p><strong className="text-navy">Demo workspace.</strong> This record saves to this browser only. Cloud sync is not connected yet.</p>
          </div>

          <button type="button" disabled={!canSaveCapture(file) || saving} onClick={save} aria-busy={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-blue/20 transition hover:bg-blue/90 disabled:cursor-not-allowed disabled:bg-navy/15 disabled:text-navy/40 disabled:shadow-none">
            {saving ? <><LoaderCircle size={17} className="animate-spin" /> Saving locally…</> : <><Check size={17} /> Save to project timeline</>}
          </button>
        </div>
      </section>
    </div>
  );
}
