import React from 'react';
import { AqeeqaInvitationData } from '../../types/wedding';
import { LuxuryCardShell, SectionHeader } from './OrnamentalDecorations';

export const RsvpWishesCard: React.FC<{
  data: AqeeqaInvitationData;
  onCelebrate?: () => void;
}> = ({ data }) => {
  return (
    <LuxuryCardShell
      theme={data.theme}
      shimmerEnabled={data.background.shimmerEnabled}
      patternId="rsvpLattice"
    >
      <div className="max-w-md mx-auto space-y-5">
        <SectionHeader
          title="Islamic Closing Message"
          goldAccent={data.theme.goldAccent}
          primaryAccent={data.theme.primaryAccent}
        />

        <div className="space-y-3 text-center">
          {data.closingDuaArabic && (
            <p
              dir="rtl"
              className="font-arabic text-lg sm:text-xl leading-relaxed"
              style={{ color: data.theme.primaryAccent }}
            >
              {data.closingDuaArabic}
            </p>
          )}
          {data.closingDuaTranslation && (
            <p className="font-serif-display italic text-xs sm:text-sm opacity-85 max-w-sm mx-auto leading-relaxed">
              {data.closingDuaTranslation}
            </p>
          )}
          {data.closingWishes && (
            <p className="font-serif-display text-xs sm:text-sm opacity-80 max-w-xs mx-auto leading-relaxed">
              {data.closingWishes}
            </p>
          )}

          {/* Special Gift Policy Message */}
          {(data.giftPolicyPrimary || data.giftPolicySecondary) && (
            <div
              className="mt-4 p-4 rounded-2xl bg-white/90 space-y-1 shadow-2xs"
              style={{ border: `1px solid ${data.theme.goldAccent}75` }}
            >
              {data.giftPolicyPrimary && (
                <p
                  className="text-sm sm:text-base font-bold leading-snug"
                  style={{ color: data.theme.primaryAccent }}
                >
                  {data.giftPolicyPrimary}
                </p>
              )}
              {data.giftPolicySecondary && (
                <p className="font-serif-display italic text-xs sm:text-sm opacity-85">
                  {data.giftPolicySecondary}
                </p>
              )}
            </div>
          )}

          {data.footerCompliments && (
            <p className="font-serif-display font-semibold text-xs tracking-wider uppercase pt-2 opacity-80">
              {data.footerCompliments}
            </p>
          )}
        </div>
      </div>
    </LuxuryCardShell>
  );
};
