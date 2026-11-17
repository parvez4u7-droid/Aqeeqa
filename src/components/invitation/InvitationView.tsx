import React, { useEffect, useState } from 'react';
import { Calendar, Mail, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useWeddingAudio } from '../../hooks/useWeddingAudio';
import { downloadWeddingIcs } from '../../lib/calendar';
import { AqeeqaInvitationData } from '../../types/wedding';
import { AmbientBackground } from './AmbientBackground';
import { BismillahHeroCard } from './BismillahHeroCard';
import { CountdownCard } from './CountdownCard';
import { EnvelopeCover } from './EnvelopeCover';
import { EventsTimelineCard } from './EventsTimelineCard';
import { ScrollRevealCard } from './OrnamentalDecorations';
import { ParticlesCanvas } from './ParticlesCanvas';
import { RsvpWishesCard } from './RsvpWishesCard';
import { ScratchRevealCard } from './ScratchRevealCard';
import { VenueMapCard } from './VenueMapCard';

interface InvitationViewProps {
  data: AqeeqaInvitationData;
  isPreview?: boolean;
}

export const InvitationView: React.FC<InvitationViewProps> = ({ data, isPreview = false }) => {
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [burstTrigger, setBurstTrigger] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const audio = useWeddingAudio(data.music.audio?.url, data.music.enabled);

  useEffect(() => {
    if (!isPreview) {
      document.title = `${data.brandTitle || 'ROYAL AQEEQA'} — ${data.childName}`;
    }
  }, [data.brandTitle, data.childName, isPreview]);

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0) {
        const y = window.scrollY || document.documentElement.scrollTop;
        setScrollProgress(Math.min(Math.max((y / scrollable) * 100, 0), 100));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [envelopeOpen]);

  const handleCelebrate = () => {
    setBurstTrigger((prev) => prev + 1);
  };

  const handleOpenEnvelope = () => {
    setEnvelopeOpen(true);
    handleCelebrate();
  };

  const handleResealEnvelope = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEnvelopeOpen(false);
  };

  const handleAttemptMusicStart = () => {
    if (audio.hasAudio) {
      void audio.play();
    }
  };

  // Attempt automatic Arabic music playback on mount & unlock on first user interaction
  useEffect(() => {
    if (isPreview || !audio.hasAudio || audio.isPlaying) return;

    let cancelled = false;
    void audio.play().then((started) => {
      if (started || cancelled) return;

      const unlockOnGesture = () => {
        if (!cancelled) {
          void audio.play();
        }
        window.removeEventListener('pointerdown', unlockOnGesture);
        window.removeEventListener('touchstart', unlockOnGesture);
        window.removeEventListener('keydown', unlockOnGesture);
      };

      window.addEventListener('pointerdown', unlockOnGesture, { passive: true, once: true });
      window.addEventListener('touchstart', unlockOnGesture, { passive: true, once: true });
      window.addEventListener('keydown', unlockOnGesture, { passive: true, once: true });
    });

    return () => {
      cancelled = true;
    };
  }, [audio.hasAudio, isPreview]);

  const musicActive = audio.isPlaying && !audio.isMuted;

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-start py-0 sm:py-8 px-0 sm:px-4 font-sans-body select-none"
      style={{ color: data.theme.textColor }}
    >
      <AmbientBackground background={data.background} theme={data.theme} />

      {data.background.particlesEnabled && (
        <ParticlesCanvas
          active={envelopeOpen}
          burstTrigger={burstTrigger}
          goldColor={data.theme.goldAccent}
        />
      )}

      {!isPreview && (
        <EnvelopeCover
          data={data}
          isOpen={envelopeOpen}
          onOpen={handleOpenEnvelope}
          onAttemptMusicStart={handleAttemptMusicStart}
        />
      )}

      {/* Centered Royal Aqeeqa Stationery Column */}
      <div
        className="relative z-10 w-full max-w-[500px] min-h-screen sm:min-h-0 sm:rounded-[34px] shadow-2xl overflow-hidden flex flex-col pb-24"
        style={{
          backgroundColor: data.theme.cardBg,
          border: `1px solid ${data.theme.goldAccent}55`,
        }}
      >
        {/* Compact Sticky Header (<= 56px) */}
        <header
          className="sticky top-0 z-30 h-[52px] flex items-center justify-between px-4 backdrop-blur-md border-b relative"
          style={{
            backgroundColor: `${data.theme.cardBg}eb`,
            borderColor: `${data.theme.goldAccent}45`,
          }}
        >
          {/* Top Scroll Progress Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[2.5px] bg-black/5 overflow-hidden pointer-events-none"
            role="progressbar"
            aria-valuenow={Math.round(scrollProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Invitation scroll progress"
          >
            <div
              className="h-full transition-all duration-150 ease-out"
              style={{
                width: `${scrollProgress}%`,
                background: `linear-gradient(90deg, ${data.theme.goldAccent}, ${data.theme.primaryAccent}, ${data.theme.goldAccent})`,
              }}
            />
          </div>

          {/* Left: Music Visualizer / Play-Pause when audio is configured */}
          <div className="flex items-center gap-1.5 min-w-[44px]">
            {audio.hasAudio && (
              <button
                type="button"
                onClick={() => void audio.togglePlay()}
                aria-label={audio.isPlaying ? 'Pause background music' : 'Play background music'}
                title={audio.isPlaying ? 'Pause music' : 'Play music'}
                className="w-9 h-9 rounded-full bg-white border flex items-center justify-center shadow-2xs transition-transform active:scale-95 cursor-pointer"
                style={{ borderColor: `${data.theme.goldAccent}65` }}
              >
                {musicActive ? (
                  <span className="flex items-end gap-[2px] h-3.5" aria-hidden="true">
                    <span
                      className="w-[2.5px] h-full rounded-full animate-eq-1"
                      style={{ backgroundColor: data.theme.primaryAccent }}
                    />
                    <span
                      className="w-[2.5px] h-full rounded-full animate-eq-2"
                      style={{ backgroundColor: data.theme.goldAccent }}
                    />
                    <span
                      className="w-[2.5px] h-full rounded-full animate-eq-3"
                      style={{ backgroundColor: data.theme.primaryAccent }}
                    />
                  </span>
                ) : (
                  <Play
                    className="w-3.5 h-3.5 ml-0.5"
                    style={{ color: data.theme.primaryAccent }}
                  />
                )}
              </button>
            )}
          </div>

          {/* Center Title */}
          <div className="text-center min-w-0 px-2">
            <span className="font-serif-display text-sm font-bold leading-none block truncate tracking-wider">
              {data.brandTitle || 'ROYAL AQEEQA'}
            </span>
            <span className="text-[10px] font-serif-display italic opacity-75 block truncate mt-0.5">
              {data.occasionTitle || 'Aqeeqa Mubarak'}
            </span>
          </div>

          {/* Right Controls: Mute + Envelope */}
          <div className="flex items-center gap-1.5">
            {audio.hasAudio && (
              <button
                type="button"
                onClick={audio.toggleMute}
                aria-label={audio.isMuted ? 'Unmute music' : 'Mute music'}
                title={audio.isMuted ? 'Unmute' : 'Mute'}
                className="w-9 h-9 rounded-full bg-white border flex items-center justify-center shadow-2xs transition-transform active:scale-95 cursor-pointer"
                style={{ borderColor: `${data.theme.goldAccent}65` }}
              >
                {audio.isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-stone-500" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" style={{ color: data.theme.goldAccent }} />
                )}
              </button>
            )}
            {!isPreview && (
              <button
                type="button"
                onClick={handleResealEnvelope}
                title="View opening envelope animation"
                className="h-9 px-2.5 rounded-full text-white text-[11px] font-medium flex items-center gap-1 shadow-2xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: data.theme.primaryAccent }}
              >
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Envelope</span>
              </button>
            )}
          </div>
        </header>

        {/* Honest Music Prompt Banner if browser blocked autoplay */}
        {audio.hasAudio && !audio.isPlaying && (audio.autoplayBlocked || audio.errorMessage) && (
          <div
            className="mx-4 mt-4 p-3 rounded-2xl bg-white/95 flex items-center justify-between gap-3 shadow-sm"
            style={{ border: `1px solid ${data.theme.goldAccent}65` }}
          >
            <div className="text-left min-w-0">
              <p className="text-xs font-semibold truncate">
                {audio.errorMessage || data.music.trackTitle || 'Background Nasheed Ready'}
              </p>
              <p className="text-[11px] opacity-70">
                {audio.errorMessage
                  ? 'Please verify the uploaded audio file in Admin.'
                  : 'Tap to enable background music'}
              </p>
            </div>
            {!audio.errorMessage && (
              <button
                type="button"
                onClick={() => void audio.play()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0 cursor-pointer"
                style={{ backgroundColor: data.theme.primaryAccent }}
              >
                Enable Music
              </button>
            )}
          </div>
        )}

        {/* Main Scrollable Aqeeqa Sections */}
        <main className="relative z-10 flex-1 px-4 sm:px-5 py-6 space-y-6">
          <ScrollRevealCard delay={0.04}>
            <BismillahHeroCard data={data} />
          </ScrollRevealCard>

          <ScrollRevealCard delay={0.06}>
            <ScratchRevealCard data={data} onCelebrate={handleCelebrate} />
          </ScrollRevealCard>

          <ScrollRevealCard delay={0.08}>
            <CountdownCard data={data} />
          </ScrollRevealCard>

          <ScrollRevealCard delay={0.1}>
            <VenueMapCard data={data} />
          </ScrollRevealCard>

          <ScrollRevealCard delay={0.12}>
            <EventsTimelineCard data={data} />
          </ScrollRevealCard>

          <ScrollRevealCard delay={0.12}>
            <RsvpWishesCard data={data} onCelebrate={handleCelebrate} />
          </ScrollRevealCard>

          {/* Footer with DigiRaiz Branding */}
          <footer className="pt-4 pb-2 text-center space-y-3">
            <div className="flex items-center justify-center gap-3 max-w-[220px] mx-auto">
              <div
                className="flex-1 h-[1px]"
                style={{ backgroundColor: `${data.theme.goldAccent}66` }}
              />
              <span className="text-xs" style={{ color: data.theme.goldAccent }}>
                ✦
              </span>
              <div
                className="flex-1 h-[1px]"
                style={{ backgroundColor: `${data.theme.goldAccent}66` }}
              />
            </div>
            <p className="font-serif-display italic text-xs opacity-75">
              {data.occasionTitle || 'Aqeeqa Mubarak'} · {data.childName}
            </p>
            <div className="pt-2 flex flex-col items-center justify-center gap-1.5">
              <span className="text-[10px] font-sans-body tracking-[0.2em] uppercase opacity-65">
                Powered by DigiRaiz
              </span>
              <div
                className="px-3.5 py-2 rounded-xl bg-white/90 shadow-2xs inline-flex items-center justify-center"
                style={{ border: `1px solid ${data.theme.goldAccent}45` }}
              >
                <img
                  src="/assets/aistudio/logo.png_09a4df48.png"
                  alt="DigiRaiz — Building the roots for your brand"
                  className="h-10 sm:h-11 w-auto object-contain"
                />
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Compact Sticky Bottom Action Bar (<= 56px) */}
      {!isPreview && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 h-[56px] px-3 backdrop-blur-md border-t shadow-2xl flex items-center justify-between gap-2 max-w-[500px] mx-auto sm:rounded-t-2xl"
          style={{
            backgroundColor: `${data.theme.cardBg}f2`,
            borderColor: `${data.theme.goldAccent}55`,
          }}
        >
          <button
            type="button"
            onClick={() => downloadWeddingIcs(data)}
            className="flex-1 h-10 px-3 rounded-xl bg-white hover:bg-stone-50 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-transform cursor-pointer whitespace-nowrap"
            style={{ border: `1px solid ${data.theme.goldAccent}65` }}
          >
            <Calendar
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: data.theme.primaryAccent }}
              aria-hidden="true"
            />
            <span>Save Date</span>
          </button>

          {audio.hasAudio && (
            <button
              type="button"
              onClick={() => void audio.togglePlay()}
              className="h-10 px-3 rounded-xl bg-white hover:bg-stone-50 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-transform cursor-pointer whitespace-nowrap"
              style={{ border: `1px solid ${data.theme.goldAccent}65` }}
              aria-label={audio.isPlaying ? 'Pause music' : 'Play music'}
            >
              {audio.isPlaying ? (
                <>
                  <Pause
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: data.theme.primaryAccent }}
                    aria-hidden="true"
                  />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: data.theme.primaryAccent }}
                    aria-hidden="true"
                  />
                  <span>Music</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleResealEnvelope}
            className="flex-1 h-10 px-3 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: data.theme.primaryAccent }}
          >
            <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Envelope</span>
          </button>
        </div>
      )}
    </div>
  );
};
