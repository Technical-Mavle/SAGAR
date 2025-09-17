import React, { useEffect, useState } from 'react';

interface LoaderOverlayProps {
  visible: boolean;
  onFinish?: () => void;
  durationMs?: number;
}

const LoaderOverlay: React.FC<LoaderOverlayProps> = ({ visible, onFinish, durationMs = 1200 }) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!visible) {
      setPercent(0);
      return;
    }
    let raf: number;
    const start = performance.now();
    const tick = (t: number) => {
      const elapsed = t - start;
      const p = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setPercent(p);
      if (elapsed < durationMs) {
        raf = requestAnimationFrame(tick);
      } else {
        onFinish && onFinish();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, durationMs, onFinish]);

  if (!visible) return null;

  const totalBars = 36;
  const filledBars = Math.round((percent / 100) * totalBars);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 text-gray-100 flex items-center justify-center">
      <div className="w-full max-w-2xl px-6">
        <div className="text-xs tracking-widest text-gray-400 mb-4">Launching</div>
        <div className="text-4xl font-mono mb-6">SAGAR</div>
        <div className="text-sm text-gray-400 mb-6">Preparing marine datasets...</div>
        <div className="flex items-end gap-3 mb-4">
          <div className="text-3xl font-mono">{percent}%</div>
          <div className="text-xs text-gray-500">{percent - 0}% since you last checked</div>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: totalBars }).map((_, i) => (
            <div
              key={i}
              className={`h-6 w-3 ${i < filledBars ? 'bg-gray-200' : 'bg-gray-700'}`}
            />
          ))}
        </div>
        <div className="mx-auto mt-6 h-1 w-16 bg-gray-600 rounded" />
      </div>
    </div>
  );
};

export default LoaderOverlay;


