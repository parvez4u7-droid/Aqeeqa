import React, { useState } from 'react';
import { Check, Clock, Copy, MapPin, Navigation, Phone } from 'lucide-react';
import { AqeeqaInvitationData } from '../../types/wedding';
import { LuxuryCardShell, SectionHeader } from './OrnamentalDecorations';

export const VenueMapCard: React.FC<{ data: AqeeqaInvitationData }> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(`${data.venueName}, ${data.venueAddress}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore clipboard errors
    }
  };

  const mapQuery = encodeURIComponent(`${data.venueName} ${data.venueAddress}`);

  return (
    <LuxuryCardShell
      theme={data.theme}
      shimmerEnabled={data.background.shimmerEnabled}
      patternId="venueLattice"
    >
      <div className="max-w-md mx-auto space-y-5">
        <SectionHeader
          title="Aqeeqa Ceremony"
          goldAccent={data.theme.goldAccent}
          primaryAccent={data.theme.primaryAccent}
        />

        {/* Structured Ceremony Details Panel */}
        <div
          className="rounded-2xl bg-white/85 p-4 sm:p-5 text-left space-y-3 shadow-xs"
          style={{ border: `1px solid ${data.theme.goldAccent}55` }}
        >
          <div className="pb-2.5 border-b" style={{ borderColor: `${data.theme.goldAccent}35` }}>
            <span
              className="text-[10px] font-sans-body font-bold tracking-[0.2em] uppercase block"
              style={{ color: data.theme.goldAccent }}
            >
              Childrens of
            </span>
            <p
              className="font-serif-display font-bold text-lg sm:text-xl mt-0.5"
              style={{ color: data.theme.primaryAccent }}
            >
              {data.fatherName}
            </p>
            <p className="font-serif-display italic text-xs opacity-75 my-0.5">and</p>
            <p
              className="font-serif-display font-bold text-lg sm:text-xl"
              style={{ color: data.theme.primaryAccent }}
            >
              {data.childName}
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{ color: data.theme.primaryAccent }}
              aria-hidden="true"
            />
            <div>
              <span
                className="text-[10px] font-bold tracking-[0.18em] uppercase block"
                style={{ color: data.theme.goldAccent }}
              >
                Time
              </span>
              <p className="font-serif-display font-semibold text-sm">
                {data.aqeeqaTime}
              </p>
            </div>
          </div>

          <div
            className="pt-2.5 border-t flex items-start gap-2.5"
            style={{ borderColor: `${data.theme.goldAccent}35` }}
          >
            <MapPin
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{ color: data.theme.primaryAccent }}
              aria-hidden="true"
            />
            <div>
              <span
                className="text-[10px] font-bold tracking-[0.18em] uppercase block"
                style={{ color: data.theme.goldAccent }}
              >
                Venue &amp; Location
              </span>
              <p className="font-serif-display font-bold text-base">
                {data.venueName}
              </p>
              <p className="font-serif-display text-xs sm:text-sm opacity-80 leading-relaxed mt-0.5">
                {data.venueAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Google Maps & Copy Address Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <a
            href={data.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-transform active:scale-95"
            style={{ backgroundColor: data.theme.primaryAccent }}
          >
            <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Open in Google Maps</span>
          </a>
          <button
            type="button"
            onClick={() => void copyAddress()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-xs font-medium shadow-2xs transition-transform active:scale-95 cursor-pointer"
            style={{ border: `1px solid ${data.theme.goldAccent}70` }}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                <span className="text-emerald-700">Address Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
                <span>Copy Address</span>
              </>
            )}
          </button>
        </div>

        {/* Embedded Interactive Map Preview */}
        <div
          className="relative w-full h-48 rounded-2xl overflow-hidden bg-stone-200 shadow-inner"
          style={{ border: `1px solid ${data.theme.goldAccent}60` }}
        >
          <iframe
            title={`Map for ${data.venueName}`}
            src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full border-0"
          />
        </div>

        {/* Clickable Family Contact Numbers */}
        {data.contacts && data.contacts.length > 0 && (
          <div
            className="pt-4 border-t space-y-3"
            style={{ borderColor: `${data.theme.goldAccent}45` }}
          >
            <p
              className="font-serif-display text-xs font-semibold tracking-[0.22em] uppercase"
              style={{ color: data.theme.goldAccent }}
            >
              Contact Numbers
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {data.contacts.map((contact) => (
                <a
                  key={contact.id}
                  href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                  className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/90 hover:bg-white text-left transition-all shadow-2xs"
                  style={{ border: `1px solid ${data.theme.goldAccent}50` }}
                >
                  <div className="min-w-0">
                    <p className="font-serif-display font-bold text-sm truncate">
                      {contact.name}
                    </p>
                    <p className="text-xs font-semibold tabular-nums mt-0.5" style={{ color: data.theme.primaryAccent }}>
                      {contact.phone}
                    </p>
                  </div>
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: data.theme.primaryAccent }}
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </LuxuryCardShell>
  );
};
