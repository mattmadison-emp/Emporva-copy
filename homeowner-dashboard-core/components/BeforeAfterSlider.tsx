import { useState, useCallback, useRef } from 'react';

// Interactive before/after comparison slider.
// Drag horizontally to reveal more of the "before" image over the "after".
// Uses clip-path on a full-size before image so both stay perfectly aligned.
// Shared by SystemGallery (per-system photos) and HomeGallery (general home photos).
export default function BeforeAfterSlider({ beforeUrl, afterUrl }: { beforeUrl: string; afterUrl: string }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] overflow-hidden rounded-lg select-none cursor-ew-resize bg-gray-100 touch-none"
      onPointerDown={e => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setFromClientX(e.clientX);
      }}
      onPointerMove={e => {
        if (dragging.current) setFromClientX(e.clientX);
      }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}
    >
      {/* After image (base layer) */}
      <img src={afterUrl} alt="After" draggable={false} className="absolute inset-0 w-full h-full object-cover" />
      {/* Before image clipped to the left of the handle */}
      <img
        src={beforeUrl}
        alt="Before"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      {/* Corner labels */}
      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold tracking-wide">
        BEFORE
      </span>
      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold tracking-wide">
        AFTER
      </span>

      {/* Drag handle */}
      <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${pos}%` }}>
        <div className="absolute top-0 bottom-0 -translate-x-1/2 w-0.5 bg-white shadow-[0_0_4px_rgba(0,0,0,0.5)]"></div>
        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center">
          <i className="ri-arrow-left-right-line text-[#0B1F33]"></i>
        </div>
      </div>
    </div>
  );
}
