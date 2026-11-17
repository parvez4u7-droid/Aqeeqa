import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { MailOpen, Sparkles } from 'lucide-react';
import { AqeeqaInvitationData } from '../../types/wedding';
import { GoldenLanternOrnament } from './OrnamentalDecorations';

interface EnvelopeCoverProps {
  data: AqeeqaInvitationData;
  isOpen: boolean;
  onOpen: () => void;
  onAttemptMusicStart: () => void;
}

export const EnvelopeCover: React.FC<EnvelopeCoverProps> = ({
  data,
  isOpen,
  onOpen,
  onAttemptMusicStart,
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [coverImgError, setCoverImgError] = useState(false);
  const prefersReduced = useReducedMotion();

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    onAttemptMusicStart();
    setTimeout(() => {
      setIsOpening(false);
      onOpen();
    }, prefersReduced ? 150 : 800);
  };

  const coverImageUrl = data.envelopeCoverImage?.url;

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          key="envelope-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: isOpening ? 0 : 1, scale: isOpening && !prefersReduced ? 1.04 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReduced ? 0.15 : 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-y-auto"
          style={{
            backgroundColor: data.theme.canvasBg,
            backgroundImage: `radial-gradient(ellipse at 50% 42%, ${data.theme.primaryAccent}48 0%, ${data.theme.canvasBg} 60%, #030b08 100%)`,
          }}
        >
          <div className="mb-3 sm:mb-4 text-center flex items-center gap-2 text-xs font-serif-display tracking-[0.26em] uppercase text-amber-200/90">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
            <span>{data.brandTitle || 'ROYAL AQEEQA'}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
          </div>

          <motion.div
            animate={
              isOpening && !prefersReduced
                ? { y: -14, scale: 1.03, rotate: 0.5 }
                : { y: 0, scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[390px] sm:max-w-[430px] rounded-3xl overflow-hidden shadow-2xl border border-amber-400/50 bg-[#061e15] flex flex-col"
          >
            {/* Top Emerald & Gold Header Plaque — High Contrast & Always Visible */}
            <div
              className="relative pt-4 pb-3.5 px-5 text-center border-b"
              style={{
                background: `linear-gradient(180deg, #04150f 0%, ${data.theme.canvasBg} 100%)`,
                borderColor: `${data.theme.goldAccent}45`,
              }}
            >
              <GoldenLanternOrnament
                color="#e5c77c"
                className="absolute top-0 left-3 w-5 h-10 opacity-85"
              />
              <GoldenLanternOrnament
                color="#e5c77c"
                className="absolute top-0 right-3 w-5 h-10 opacity-85"
              />

              <p
                dir="rtl"
                className="font-arabic text-base sm:text-lg text-amber-100 drop-shadow"
              >
                {data.bismillahArabic}
              </p>
              <p className="font-serif-display text-[10px] tracking-[0.24em] uppercase text-amber-300/90 mt-1">
                {data.openingSubtitle || 'A Special Invitation'}
              </p>
              <h1 className="font-serif-display font-bold text-lg sm:text-xl tracking-[0.2em] uppercase text-white mt-0.5 drop-shadow">
                {data.occasionTitle || 'AQEEQA MUBARAK'}
              </h1>

              <div
                className="mt-2 pt-2 border-t max-w-[290px] mx-auto"
                style={{ borderColor: `${data.theme.goldAccent}35` }}
              >
                <p className="font-serif-display text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-amber-300 font-semibold">
                  Childrens of
                </p>
                <p className="font-serif-display font-bold text-base sm:text-lg text-amber-100 mt-0.5 leading-snug">
                  {data.fatherName}
                </p>
                <p className="font-serif-display italic text-[11px] text-amber-200/80 leading-none my-0.5">
                  and
                </p>
                <p className="font-serif-display font-bold text-base sm:text-lg text-amber-100 leading-snug">
                  {data.childName}
                </p>
              </div>
            </div>

            {/* Middle Ivory Envelope Artwork + Interactive Golden Wax Seal */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/10] bg-[#f6f1e6] overflow-hidden">
              {coverImageUrl && !coverImgError ? (
                <img
                  src={coverImageUrl}
                  alt={`Aqeeqa Mubarak invitation envelope for ${data.childName}`}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  onError={() => setCoverImgError(true)}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(155deg, ${data.theme.cardBg} 0%, #ede4d1 100%)`,
                  }}
                />
              )}

              {/* Interactive Golden Wax Seal */}
              <button
                type="button"
                onClick={handleOpen}
                disabled={isOpening}
                aria-label="Tap golden seal to open invitation"
                className="group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer animate-wax-pop z-20"
              >
                <span
                  className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-2 border-amber-100/80 shadow-2xl transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
                  style={{
                    background:
                      'radial-gradient(circle at 32% 28%, #f7e6ad 0%, #c9a24d 52%, #856218 100%)',
                    boxShadow:
                      '0 10px 28px rgba(0,0,0,0.45), inset 0 2px 6px rgba(255,250,220,0.65)',
                  }}
                >
                  <span className="font-serif-display text-sm font-bold tracking-wider text-emerald-950">
                    ☾ ✦
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-950/90 mt-0.5">
                    Seal
                  </span>
                </span>
              </button>
            </div>

            {/* Bottom Invitation Line & OPEN INVITATION Button */}
            <div
              className="py-4 px-5 text-center border-t"
              style={{
                background: `linear-gradient(180deg, ${data.theme.canvasBg} 0%, #04150f 100%)`,
                borderColor: `${data.theme.goldAccent}45`,
              }}
            >
              <p className="font-serif-display italic text-sm text-amber-100 mb-3">
                {data.openingInvitationLine || 'You are Cordially Invited'}
              </p>
              <button
                type="button"
                onClick={handleOpen}
                disabled={isOpening}
                className="w-full py-3 px-5 rounded-xl text-xs font-semibold tracking-[0.18em] uppercase text-white shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-amber-300/50"
                style={{
                  backgroundColor: data.theme.primaryAccent,
                }}
              >
                <MailOpen className="w-4 h-4 text-amber-200" aria-hidden="true" />
                <span>OPEN INVITATION</span>
              </button>
              <p className="text-[11px] font-serif-display italic text-amber-100/80 mt-2">
                {data.music.enabled && data.music.audio?.url
                  ? 'Tap golden seal or button to unveil card & play music'
                  : 'Tap golden seal or button to unveil invitation'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
