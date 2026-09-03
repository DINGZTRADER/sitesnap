'use client';

import { useEffect } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';

export function PricingPanel({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/55 p-4 backdrop-blur-sm" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="pricing-title">
      <div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-blue">Simple commercial model</p><h2 id="pricing-title" className="mt-2 text-2xl font-black text-navy">Built for small teams</h2></div><button type="button" onClick={onClose} aria-label="Close pricing dialog" className="rounded-full border border-line p-2 text-navy/55 transition hover:bg-canvas"><X size={18} /></button></div>
      <div className="mt-5 rounded-2xl bg-navy p-5 text-white"><p className="text-sm font-black text-lime">STANDARD COMPANY</p><div className="mt-2 flex items-baseline gap-1"><span className="text-4xl font-black">£179</span><span className="text-sm text-white/60">/ month</span></div><p className="mt-2 text-sm leading-5 text-white/65">Professional site photo records without enterprise software pricing.</p><div className="mt-5 space-y-3">{['Up to 10 team members', '15 active sites', 'Photo timeline, tags and client-ready records', 'No per-seat pricing'].map(item => <p key={item} className="flex items-center gap-2 text-sm"><Check size={16} className="text-lime" />{item}</p>)}</div></div>
      <div className="mt-4 rounded-2xl border border-line p-4"><div className="flex justify-between text-sm font-black text-navy"><span>Assisted setup</span><span>£295 total</span></div><p className="mt-2 text-xs leading-5 text-navy/55">£99 to start, then £196 when your workspace is ready to use.</p></div>
      <button type="button" onClick={onClose} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue px-4 py-3 text-sm font-black text-white shadow-md shadow-blue/15 transition hover:bg-blue/90">Book a guided pilot <ArrowRight size={16} /></button>
    </section>
  </div>;
}
