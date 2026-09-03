'use client';
import { useEffect, useRef, useState } from 'react';

export function BeforeAfter({ before, after }: { before: string; after: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [width, setWidth] = useState(0);
  useEffect(() => { const update = () => setWidth(containerRef.current?.offsetWidth ?? 0); update(); const observer = new ResizeObserver(update); if (containerRef.current) observer.observe(containerRef.current); return () => observer.disconnect(); }, []);
  const move = (clientX: number) => { const rect = containerRef.current?.getBoundingClientRect(); if (!rect) return; setPosition(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))); };
  return <div ref={containerRef} className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-ink" onPointerMove={event => { if (event.buttons === 1) move(event.clientX); }} onPointerDown={event => move(event.clientX)}><img src={after} alt="After works" className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${position}%` }}><img src={before} alt="Before works" className="absolute left-0 top-0 h-full max-w-none object-cover" style={{ width }} /></div><div className="absolute inset-y-0 w-1 bg-white shadow" style={{ left: `${position}%` }}><div className="absolute left-1/2 top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-xs font-black text-ink">↔</div></div><span className="absolute left-3 top-3 rounded-md bg-ink/70 px-2 py-1 text-[10px] font-black text-white">BEFORE</span><span className="absolute right-3 top-3 rounded-md bg-ink/70 px-2 py-1 text-[10px] font-black text-white">AFTER</span></div>;
}
