import React, { useState } from 'react';
import { Clock, MapPin, Navigation } from 'lucide-react';
import { AqeeqaInvitationData } from '../../types/wedding';
import { LuxuryCardShell, SectionHeader } from './OrnamentalDecorations';

export const EventsTimelineCard: React.FC<{ data: AqeeqaInvitationData }> = ({ data }) => {
  const [failedPhotoIds, setFailedPhotoIds] = useState<Record<string, boolean>>({});

  if (!data.events || data.events.length === 0) return null;

  return (
    <LuxuryCardShell
      theme={data.theme}
      shimmerEnabled={data.background.shimmerEnabled}
      patternId="eventsLattice"
    >
      <div className="max-w-md mx-auto">
        <SectionHeader
          title="Aqeeqa Ceremony Details"
          goldAccent={data.theme.goldAccent}
          primaryAccent={data.theme.primaryAccent}
        />

        <div className="space-y-8">
          {data.events.map((ev, index) => (
            <article
              key={ev.id}
              className="relative pb-7 last:pb-0 border-b last:border-b-0"
              style={{ borderColor: `${data.theme.goldAccent}40` }}
            >
              <p
                className="font-serif-display text-[11px] font-semibold tracking-[0.2em] uppercase opacity-75"
                style={{ color: data.theme.goldAccent }}
              >
                {String(index + 1).padStart(2, '0')}. Gathering
              </p>
              <h3
                className="font-serif-display font-bold text-xl sm:text-2xl tracking-wide mt-0.5"
                style={{ color: data.theme.primaryAccent }}
              >
                {ev.title}
              </h3>

              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold opacity-90">
                <Clock
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: data.theme.goldAccent }}
                  aria-hidden="true"
                />
                <span>{ev.time}</span>
              </div>

              {ev.photo?.url && !failedPhotoIds[ev.id] && (
                <div
                  className="mt-3.5 mx-auto max-w-xs aspect-[16/10] rounded-2xl overflow-hidden shadow-sm bg-stone-100"
                  style={{ border: `1px solid ${data.theme.goldAccent}55` }}
                >
                  <img
                    src={ev.photo.url}
                    alt={ev.title}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedPhotoIds((prev) => ({ ...prev, [ev.id]: true }))
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="mt-3 space-y-1 text-xs font-serif-display">
                <p className="font-bold text-sm flex items-center justify-center gap-1.5">
                  <MapPin
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: data.theme.primaryAccent }}
                    aria-hidden="true"
                  />
                  <span>{ev.venue}</span>
                </p>
                <p className="opacity-80 max-w-xs mx-auto leading-relaxed">
                  {ev.address}
                </p>
                {ev.description && (
                  <p className="italic opacity-75 max-w-xs mx-auto pt-1 leading-relaxed">
                    {ev.description}
                  </p>
                )}
              </div>

              {ev.googleMapsUrl && (
                <div className="mt-3.5">
                  <a
                    href={ev.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-stone-50 text-xs font-medium shadow-2xs transition-transform active:scale-95"
                    style={{
                      border: `1px solid ${data.theme.goldAccent}70`,
                      color: data.theme.textColor,
                    }}
                  >
                    <Navigation
                      className="w-3.5 h-3.5"
                      style={{ color: data.theme.primaryAccent }}
                      aria-hidden="true"
                    />
                    <span>Get Directions</span>
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </LuxuryCardShell>
  );
};
