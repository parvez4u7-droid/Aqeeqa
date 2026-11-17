import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { AqeeqaInvitationData } from '../../types/wedding';
import { LuxuryCardShell, SectionHeader } from './OrnamentalDecorations';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function computeTimeLeft(targetIso: string): TimeLeft {
  const targetMs = new Date(targetIso).getTime();
  if (Number.isNaN(targetMs)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false };
  }
  const diff = targetMs - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    isPast: false,
  };
}

export const CountdownCard: React.FC<{ data: AqeeqaInvitationData }> = ({ data }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    computeTimeLeft(data.targetDateTime)
  );
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    setTimeLeft(computeTimeLeft(data.targetDateTime));
    const timer = setInterval(() => {
      setTimeLeft(computeTimeLeft(data.targetDateTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [data.targetDateTime]);

  const pad = (n: number) => String(n).padStart(2, '0');

  const units = [
    { label: 'Days', value: pad(timeLeft.days) },
    { label: 'Hours', value: pad(timeLeft.hours) },
    { label: 'Minutes', value: pad(timeLeft.minutes) },
    { label: 'Seconds', value: pad(timeLeft.seconds) },
  ];

  return (
    <LuxuryCardShell
      theme={data.theme}
      shimmerEnabled={data.background.shimmerEnabled}
      patternId="countdownLattice"
    >
      <div className="max-w-md mx-auto">
        <SectionHeader
          title="Aqeeqa Countdown"
          goldAccent={data.theme.goldAccent}
          primaryAccent={data.theme.primaryAccent}
        />

        {timeLeft.isPast ? (
          <div
            className="py-5 px-4 rounded-2xl bg-white/85 border"
            style={{ borderColor: `${data.theme.goldAccent}60` }}
          >
            <p
              className="font-serif-display text-lg sm:text-xl font-bold"
              style={{ color: data.theme.primaryAccent }}
            >
              Aqeeqa Mubarak
            </p>
            <p className="font-serif-display italic text-xs sm:text-sm mt-2 opacity-90 leading-relaxed">
              {data.postEventMessage ||
                'Alhamdulillah! The blessed Aqeeqa celebration has arrived.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-3 py-1">
            {units.map((unit) => (
              <div
                key={unit.label}
                className="flex flex-col items-center justify-center py-3 px-1.5 sm:px-3 rounded-2xl bg-white/85 shadow-xs transition-transform duration-200 hover:-translate-y-0.5"
                style={{ border: `1px solid ${data.theme.goldAccent}55` }}
              >
                <div className="relative h-9 sm:h-11 flex items-center justify-center overflow-hidden">
                  {prefersReduced ? (
                    <span
                      className="font-serif-display text-2xl sm:text-4xl font-bold tabular-nums"
                      style={{ color: data.theme.primaryAccent }}
                    >
                      {unit.value}
                    </span>
                  ) : (
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={unit.value}
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -8, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="font-serif-display text-2xl sm:text-4xl font-bold tabular-nums block"
                        style={{ color: data.theme.primaryAccent }}
                      >
                        {unit.value}
                      </motion.span>
                    </AnimatePresence>
                  )}
                </div>
                <span
                  className="font-sans-body text-[9px] sm:text-[10px] tracking-[0.16em] uppercase mt-1 font-semibold"
                  style={{ color: data.theme.goldAccent }}
                >
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </LuxuryCardShell>
  );
};
