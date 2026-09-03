'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { updateComparisonPosition } from '@/lib/evidence';

export function BeforeAfter({ before, after }: { before: string; after: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => setWidth(containerRef.current?.offsetWidth ?? 0);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const move = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    setPosition(current => updateComparisonPosition(current, event.key));
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-navy outline-none focus-visible:ring-4 focus-visible:ring-blue/25"
      role="slider"
      tabIndex={0}
      aria-label="Before and after comparison. Use arrow keys to move the divider."
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      aria-valuetext={Math.round(position) + '% before image visible'}
      onKeyDown={handleKeyDown}
      onPointerMove={event => { if (event.buttons === 1) move(event.clientX); }}
      onPointerDown={event => move(event.clientX)}
      onDoubleClick={() => setPosition(50)}
    >
      <img src={after} alt="After works" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: position + '%' }}>
        <img src={before} alt="Before works" className="absolute left-0 top-0 h-full max-w-none object-cover" style={{ width }} />
      </div>
      <div className="absolute inset-y-0 w-1 bg-white shadow-lg" style={{ left: position + '%' }}>
        <div className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-blue text-lg font-black text-white shadow-lg">
          ↔
        </div>
      </div>
      <span className="absolute left-3 top-3 rounded-md bg-navy/80 px-2.5 py-1.5 text-[10px] font-black tracking-wider text-white">BEFORE</span>
      <span className="absolute right-3 top-3 rounded-md bg-navy/80 px-2.5 py-1.5 text-[10px] font-black tracking-wider text-white">AFTER</span>
      <span className="sr-only">Drag the divider or use the left and right arrow keys to compare site progress.</span>
    </div>
  );
}
