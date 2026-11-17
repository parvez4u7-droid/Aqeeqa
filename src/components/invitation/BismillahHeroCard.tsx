import React from 'react';
import { ChevronDown } from 'lucide-react';
import { AqeeqaInvitationData } from '../../types/wedding';
import {
  getTypographyClasses,
  GoldenLanternOrnament,
  LaceDivider,
  LuxuryCardShell,
} from './OrnamentalDecorations';

export const BismillahHeroCard: React.FC<{ data: AqeeqaInvitationData }> = ({ data }) => {
  const typo = getTypographyClasses(data.theme.typographyPreset);

  return (
    <LuxuryCardShell
      theme={data.theme}
      shimmerEnabled={data.background.shimmerEnabled}
      patternId="bismillahLattice"
    >
      <div className="relative max-w-md mx-auto space-y-4 pt-1">
        {/* Decorative Golden Lanterns */}
        <GoldenLanternOrnament
          color={data.theme.goldAccent}
          className="hidden sm:block absolute -top-2 left-2 w-6 h-12 opacity-80"
        />
        <GoldenLanternOrnament
          color={data.theme.goldAccent}
          className="hidden sm:block absolute -top-2 right-2 w-6 h-12 opacity-80"
        />

        {/* Bismillah Calligraphy */}
        <div className="pt-1 pb-1 flex flex-col items-center">
          <p
            dir="rtl"
            className="font-arabic text-2xl sm:text-[28px] leading-relaxed font-bold"
            style={{ color: data.theme.primaryAccent }}
            aria-label="Bismillahir Rahmanir Rahim"
          >
            {data.bismillahArabic}
          </p>
        </div>

        {/* AQEEQA MUBARAK Heading */}
        <div className="space-y-1">
          <p
            className="font-serif-display font-bold text-sm sm:text-base tracking-[0.28em] uppercase"
            style={{ color: data.theme.goldAccent }}
          >
            {data.occasionTitle || 'AQEEQA MUBARAK'}
          </p>
          <p className="font-serif-display italic text-xs sm:text-sm opacity-85">
            {data.invitationLead}
          </p>
        </div>

        {/* Big Calligraphic Script Name at Top: Syed Yusuf Ali Jagirdar */}
        <div className="pt-2 pb-1">
          <div className="flex items-center justify-center gap-3 mb-1.5" aria-hidden="true">
            <div className="w-10 h-[1px]" style={{ backgroundColor: `${data.theme.goldAccent}88` }} />
            <span className="text-xs" style={{ color: data.theme.goldAccent }}>
              ✦
            </span>
            <div className="w-10 h-[1px]" style={{ backgroundColor: `${data.theme.goldAccent}88` }} />
          </div>
          <h1
            className={`${typo.script} text-[38px] sm:text-[46px] leading-tight font-normal px-2`}
            style={{ color: data.theme.primaryAccent }}
          >
            {data.grandfatherName}
          </h1>
          <div className="flex items-center justify-center gap-3 mt-1.5" aria-hidden="true">
            <div className="w-10 h-[1px]" style={{ backgroundColor: `${data.theme.goldAccent}88` }} />
            <span className="text-xs" style={{ color: data.theme.goldAccent }}>
              ✦
            </span>
            <div className="w-10 h-[1px]" style={{ backgroundColor: `${data.theme.goldAccent}88` }} />
          </div>
        </div>

        <p className="font-serif-display italic text-xs sm:text-sm max-w-sm mx-auto leading-relaxed opacity-90 pt-1">
          {data.invitationMessage}
        </p>

        {/* Two Names in Serif Style: Syed Kashif Ali Jagirdar and Syed Aakif Ali Jagirdar */}
        <div className="pt-1 pb-1 space-y-1.5">
          <h2
            className="font-serif-display font-bold text-2xl sm:text-[30px] leading-tight tracking-tight"
            style={{ color: data.theme.primaryAccent }}
          >
            {data.fatherName}
          </h2>
          <p className="font-serif-display italic text-xs sm:text-sm opacity-75">and</p>
          <h2
            className="font-serif-display font-bold text-2xl sm:text-[30px] leading-tight tracking-tight"
            style={{ color: data.theme.primaryAccent }}
          >
            {data.childName}
          </h2>
        </div>

        {/* Dua & Invitation Closing Line */}
        <p className="font-serif-display italic text-xs sm:text-sm max-w-sm mx-auto leading-relaxed opacity-85">
          {data.invitationClosingLine}
        </p>

        {/* Sunnah Child Blessing Dua */}
        {data.quranVerseArabic && (
          <div
            className="pt-3 pb-1 border-t space-y-1.5"
            style={{ borderColor: `${data.theme.goldAccent}45` }}
          >
            <p
              dir="rtl"
              className="font-arabic text-base sm:text-lg leading-relaxed"
              style={{ color: data.theme.primaryAccent }}
            >
              {data.quranVerseArabic}
            </p>
            <p className="font-serif-display italic text-[11px] sm:text-xs opacity-80 max-w-sm mx-auto leading-relaxed">
              {data.quranVerseTranslation}
            </p>
          </div>
        )}

        <LaceDivider color={data.theme.goldAccent} className="pt-2" />

        <div className="pt-1 flex flex-col items-center justify-center animate-gentle-bounce pointer-events-none">
          <span className="text-[10px] font-serif-display uppercase tracking-[0.25em] font-semibold opacity-70">
            Scroll for Details
          </span>
          <ChevronDown
            className="w-4 h-4 mt-0.5"
            style={{ color: data.theme.goldAccent }}
            aria-hidden="true"
          />
        </div>
      </div>
    </LuxuryCardShell>
  );
};
