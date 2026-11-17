import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, Check } from 'lucide-react';
import { downloadWeddingIcs } from '../../lib/calendar';
import { AqeeqaInvitationData } from '../../types/wedding';
import { LuxuryCardShell, SectionHeader } from './OrnamentalDecorations';

export const ScratchRevealCard: React.FC<{
  data: AqeeqaInvitationData;
  onCelebrate: () => void;
}> = ({ data, onCelebrate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [savedCalendar, setSavedCalendar] = useState(false);

  const paintFoil = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // Islamic Arch Medallion Clip Path
    ctx.beginPath();
    ctx.moveTo(20, h - 14);
    ctx.lineTo(20, h * 0.44);
    ctx.quadraticCurveTo(20, 26, w / 2, 10);
    ctx.quadraticCurveTo(w - 20, 26, w - 20, h * 0.44);
    ctx.lineTo(w - 20, h - 14);
    ctx.closePath();
    ctx.clip();

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#f7f1e3');
    grad.addColorStop(0.28, '#e6d3a7');
    grad.addColorStop(0.55, '#d4b46a');
    grad.addColorStop(0.8, '#b8923a');
    grad.addColorStop(1, '#8c6b23');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 320; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#fef3c7';
      ctx.globalAlpha = 0.2 + Math.random() * 0.4;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 0.5 + Math.random() * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 0.92;
    ctx.fillStyle = '#1b3629';
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH TO REVEAL DATE', w / 2, h / 2 + 8);
    ctx.restore();
  }, []);

  useEffect(() => {
    paintFoil();
  }, [paintFoil]);

  const checkRevealProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    const totalSampled = pixels.length / 16;
    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] === 0) cleared++;
    }
    if ((cleared / totalSampled) * 100 > 32) {
      setRevealed(true);
      onCelebrate();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const scratchAt = (clientX: number, clientY: number) => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
    checkRevealProgress();
  };

  const handleSaveDate = () => {
    downloadWeddingIcs(data);
    setSavedCalendar(true);
    setTimeout(() => setSavedCalendar(false), 3000);
  };

  return (
    <LuxuryCardShell
      theme={data.theme}
      shimmerEnabled={data.background.shimmerEnabled}
      patternId="scratchLattice"
    >
      <div className="max-w-sm mx-auto">
        <SectionHeader
          title="Save The Blessed Date"
          goldAccent={data.theme.goldAccent}
          primaryAccent={data.theme.primaryAccent}
        />

        <div className="relative w-64 h-52 mx-auto my-2 flex items-center justify-center select-none touch-none">
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-5 bg-[#fdfbf7] shadow-inner rounded-t-[130px] rounded-b-2xl"
            style={{
              border: `1px solid ${data.theme.goldAccent}80`,
            }}
          >
            <div className="space-y-1 px-2 pt-2">
              <p
                className="font-serif-display font-bold text-xs tracking-widest uppercase"
                style={{ color: data.theme.primaryAccent }}
              >
                {data.occasionTitle || 'AQEEQA MUBARAK'}
              </p>
              <p className="font-serif-display text-xs font-medium text-stone-600">
                {data.aqeeqaDay}
              </p>
              <p className="font-serif-display font-bold text-xl text-stone-900 tracking-tight">
                {data.aqeeqaDate}
              </p>
              {data.hijriDate && (
                <p className="font-serif-display text-[11px] text-stone-700 font-medium">
                  {data.hijriDate}
                </p>
              )}
              <p
                className="font-sans-body text-[11px] font-semibold pt-0.5"
                style={{ color: data.theme.goldAccent }}
              >
                {data.aqeeqaTime}
              </p>
              <p className="font-serif-display text-[11px] text-stone-700">
                {data.venueName}
              </p>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={280}
            height={220}
            onMouseDown={(e) => {
              setIsScratching(true);
              scratchAt(e.clientX, e.clientY);
            }}
            onMouseMove={(e) => {
              if (isScratching) scratchAt(e.clientX, e.clientY);
            }}
            onMouseUp={() => setIsScratching(false)}
            onMouseLeave={() => setIsScratching(false)}
            onTouchStart={(e) => {
              if (e.touches.length > 0) {
                setIsScratching(true);
                scratchAt(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchMove={(e) => {
              if (isScratching && e.touches.length > 0) {
                scratchAt(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={() => setIsScratching(false)}
            className={`absolute inset-0 w-full h-full cursor-pointer z-10 transition-opacity duration-700 rounded-t-[130px] rounded-b-2xl ${
              revealed ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
          />
        </div>

        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            {!revealed && (
              <button
                type="button"
                onClick={() => {
                  setRevealed(true);
                  onCelebrate();
                }}
                className="px-3.5 py-2 rounded-lg text-xs font-medium border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
              >
                Tap to Reveal
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveDate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase text-white shadow-sm active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: data.theme.primaryAccent }}
            >
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Save The Date</span>
            </button>
          </div>
          {savedCalendar && (
            <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Calendar invite saved for {data.aqeeqaDate}</span>
            </p>
          )}
        </div>
      </div>
    </LuxuryCardShell>
  );
};
