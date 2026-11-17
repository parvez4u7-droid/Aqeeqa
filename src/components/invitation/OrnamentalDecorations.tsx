import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ThemeSettings } from '../../types/wedding';

export function getTypographyClasses(preset: ThemeSettings['typographyPreset']) {
  switch (preset) {
    case 'mughal-classic':
      return {
        script: 'font-serif-display italic',
        display: 'font-serif-display',
        body: 'font-serif-display',
      };
    case 'modern-editorial':
      return {
        script: 'font-serif-display',
        display: 'font-serif-display',
        body: 'font-sans-body',
      };
    case 'royal-script':
    default:
      return {
        script: 'font-script',
        display: 'font-serif-display',
        body: 'font-sans-body',
      };
  }
}

export const IslamicLatticePattern: React.FC<{
  color?: string;
  opacity?: number;
  patternId?: string;
}> = ({ color = '#8b734b', opacity = 0.09, patternId = 'islamicLattice' }) => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
    aria-hidden="true"
  >
    <defs>
      <pattern id={patternId} width="36" height="36" patternUnits="userSpaceOnUse">
        <path
          d="M 18 0 L 36 18 L 18 36 L 0 18 Z"
          fill="none"
          stroke={color}
          strokeWidth="0.7"
        />
        <path
          d="M 18 4 L 32 18 L 18 32 L 4 18 Z"
          fill="none"
          stroke={color}
          strokeWidth="0.4"
          strokeDasharray="1.5 2"
        />
        <circle cx="18" cy="18" r="1.4" fill={color} opacity="0.65" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${patternId})`} />
  </svg>
);

export const GoldenLanternOrnament: React.FC<{
  color?: string;
  className?: string;
}> = ({ color = '#b8923a', className = '' }) => (
  <svg
    viewBox="0 0 36 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none pointer-events-none ${className}`}
    aria-hidden="true"
  >
    <line x1="18" y1="0" x2="18" y2="12" stroke={color} strokeWidth="1.2" />
    <circle cx="18" cy="14" r="2.2" stroke={color} strokeWidth="1.1" />
    <path
      d="M11 22 C11 17 18 15 18 15 C18 15 25 17 25 22 L28 26 L8 26 Z"
      stroke={color}
      strokeWidth="1.2"
      fill={color}
      fillOpacity="0.14"
    />
    <path
      d="M9 26 L27 26 L24 46 L12 46 Z"
      stroke={color}
      strokeWidth="1.2"
      fill={color}
      fillOpacity="0.08"
    />
    <path d="M18 28 L18 44" stroke={color} strokeWidth="0.8" strokeOpacity="0.7" />
    <circle cx="18" cy="36" r="3" fill={color} fillOpacity="0.45" />
    <path
      d="M12 46 L24 46 L20 52 L16 52 Z"
      stroke={color}
      strokeWidth="1.1"
      fill={color}
      fillOpacity="0.18"
    />
    <path d="M18 52 L18 60" stroke={color} strokeWidth="1" />
    <circle cx="18" cy="61.5" r="1.5" fill={color} />
  </svg>
);

export const CornerArabesque: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color?: string;
  className?: string;
}> = ({ position, color = '#b8923a', className = '' }) => {
  const transformClass =
    position === 'top-right'
      ? 'scale-x-[-1]'
      : position === 'bottom-left'
        ? 'scale-y-[-1]'
        : position === 'bottom-right'
          ? 'scale-x-[-1] scale-y-[-1]'
          : '';

  return (
    <div
      className={`w-11 h-11 sm:w-12 sm:h-12 select-none pointer-events-none ${transformClass} ${className}`}
      style={{ color }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path
          d="M 1 55 L 1 10 C 1 4.5 4.5 1 10 1 L 55 1"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <path
          d="M 5 55 L 5 12 C 5 8.2 8.2 5 12 5 L 55 5"
          stroke="currentColor"
          strokeWidth="0.65"
          strokeDasharray="2.5 2"
        />
        <path
          d="M 10 19 C 10 10 19 10 23 14 C 27 18 20 27 14 22 C 9.5 18.5 10 13 16 11"
          stroke="currentColor"
          strokeWidth="0.9"
        />
        <circle cx="16" cy="16" r="1.8" fill="currentColor" />
        <path
          d="M 14 32 C 19 29 25 24 32 14"
          stroke="currentColor"
          strokeWidth="0.75"
        />
        <circle cx="32" cy="14" r="1.2" fill="currentColor" />
      </svg>
    </div>
  );
};

export const LaceDivider: React.FC<{ color?: string; className?: string }> = ({
  color = '#b8923a',
  className = '',
}) => (
  <div className={`w-full overflow-hidden select-none pointer-events-none ${className}`} aria-hidden="true">
    <svg
      viewBox="0 0 320 28"
      preserveAspectRatio="none"
      className="w-full h-6 opacity-75"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="cardLaceRepeat" width="40" height="28" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="14" r="8.5" stroke={color} strokeWidth="0.75" strokeDasharray="2 1.5" />
          <circle cx="20" cy="14" r="4.2" stroke={color} strokeWidth="0.75" />
          <circle cx="20" cy="14" r="1.4" fill={color} />
          <path d="M 0 14 Q 10 1 20 14 Q 30 27 40 14" stroke={color} strokeWidth="0.55" fill="none" />
          <path d="M 0 14 Q 10 27 20 14 Q 30 1 40 14" stroke={color} strokeWidth="0.55" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="28" fill="url(#cardLaceRepeat)" />
    </svg>
  </div>
);

export const SectionHeader: React.FC<{
  title: string;
  goldAccent: string;
  primaryAccent: string;
}> = ({ title, goldAccent, primaryAccent }) => (
  <div className="mb-5 text-center">
    <h2
      className="font-serif-display text-xs sm:text-[13px] font-semibold tracking-[0.26em] uppercase"
      style={{ color: goldAccent }}
    >
      {title}
    </h2>
    <div className="flex items-center justify-center gap-2.5 mt-1.5" aria-hidden="true">
      <div className="w-10 h-[1px]" style={{ backgroundColor: `${goldAccent}66` }} />
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1.5L9.8 6.2L14.5 8L9.8 9.8L8 14.5L6.2 9.8L1.5 8L6.2 6.2L8 1.5Z"
          fill={primaryAccent}
          fillOpacity="0.85"
        />
      </svg>
      <div className="w-10 h-[1px]" style={{ backgroundColor: `${goldAccent}66` }} />
    </div>
  </div>
);

export const LuxuryCardShell: React.FC<{
  children: React.ReactNode;
  theme: ThemeSettings;
  shimmerEnabled?: boolean;
  patternId: string;
  className?: string;
}> = ({ children, theme, shimmerEnabled = true, patternId, className = '' }) => (
  <section
    className={`relative w-full overflow-hidden rounded-3xl shadow-3d-luxury card-3d-hover p-6 sm:p-8 text-center ${className}`}
    style={{
      backgroundColor: theme.cardBg,
      color: theme.textColor,
      border: `1px solid ${theme.goldAccent}55`,
    }}
  >
    {shimmerEnabled && (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl" aria-hidden="true">
        <div className="w-[90px] h-[300%] bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer-sweep" />
      </div>
    )}

    <IslamicLatticePattern color={theme.goldAccent} opacity={0.1} patternId={patternId} />

    <div
      className="absolute inset-2 sm:inset-2.5 rounded-2xl pointer-events-none"
      style={{ border: `1px solid ${theme.goldAccent}45` }}
      aria-hidden="true"
    />
    <div
      className="absolute inset-3 sm:inset-3.5 rounded-xl pointer-events-none"
      style={{ border: `1px solid ${theme.goldAccent}25` }}
      aria-hidden="true"
    />

    <CornerArabesque position="top-left" color={theme.goldAccent} className="absolute top-2 left-2 z-10 opacity-75" />
    <CornerArabesque position="top-right" color={theme.goldAccent} className="absolute top-2 right-2 z-10 opacity-75" />
    <CornerArabesque position="bottom-left" color={theme.goldAccent} className="absolute bottom-2 left-2 z-10 opacity-75" />
    <CornerArabesque position="bottom-right" color={theme.goldAccent} className="absolute bottom-2 right-2 z-10 opacity-75" />

    <div className="relative z-10">{children}</div>
  </section>
);

export const ScrollRevealCard: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.65,
        delay: Math.min(delay, 0.25),
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
};
