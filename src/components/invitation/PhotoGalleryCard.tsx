import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, ImageIcon, X, ZoomIn } from 'lucide-react';
import { AqeeqaInvitationData, GalleryPhotoItem } from '../../types/wedding';
import { LuxuryCardShell, SectionHeader } from './OrnamentalDecorations';

export const PhotoGalleryCard: React.FC<{ data: AqeeqaInvitationData }> = ({ data }) => {
  const photos = useMemo(() => {
    const items: GalleryPhotoItem[] = [];
    const seenUrls = new Set<string>();

    if (data.babyPhoto?.url) {
      seenUrls.add(data.babyPhoto.url);
      items.push({
        id: 'featured-baby-photo',
        attachmentId: data.babyPhoto.attachmentId,
        url: data.babyPhoto.url,
        caption: data.babyPhotoCaption || data.childName,
        category: 'baby',
        order: -2,
      });
    }

    if (data.familyPhoto?.url && !seenUrls.has(data.familyPhoto.url)) {
      seenUrls.add(data.familyPhoto.url);
      items.push({
        id: 'featured-family-photo',
        attachmentId: data.familyPhoto.attachmentId,
        url: data.familyPhoto.url,
        caption: data.familyPhotoCaption || data.familySubtitle,
        category: 'family',
        order: -1,
      });
    }

    const sortedGallery = [...(data.gallery || [])].sort((a, b) => a.order - b.order);
    for (const g of sortedGallery) {
      if (!seenUrls.has(g.url)) {
        seenUrls.add(g.url);
        items.push(g);
      }
    }

    return items;
  }, [
    data.babyPhoto,
    data.babyPhotoCaption,
    data.childName,
    data.familyPhoto,
    data.familyPhotoCaption,
    data.familySubtitle,
    data.gallery,
  ]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});
  const touchStartX = useRef<number | null>(null);
  const prefersReduced = useReducedMotion();

  const close = useCallback(() => setActiveIndex(null), []);

  const showPrev = useCallback(() => {
    setActiveIndex((idx) =>
      idx === null ? null : (idx - 1 + photos.length) % photos.length
    );
  }, [photos.length]);

  const showNext = useCallback(() => {
    setActiveIndex((idx) => (idx === null ? null : (idx + 1) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, close, showPrev, showNext]);

  if (photos.length === 0) return null;

  const activePhoto: GalleryPhotoItem | null =
    activeIndex !== null ? photos[activeIndex] || null : null;

  return (
    <>
      <LuxuryCardShell
        theme={data.theme}
        shimmerEnabled={data.background.shimmerEnabled}
        patternId="galleryLattice"
      >
        <div className="max-w-md mx-auto">
          <SectionHeader
            title="Baby & Family Gallery"
            goldAccent={data.theme.goldAccent}
            primaryAccent={data.theme.primaryAccent}
          />

          <p className="font-serif-display italic text-xs sm:text-sm opacity-80 mb-4 -mt-2">
            Precious moments of {data.childName} &amp; family celebrations
          </p>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`group relative overflow-hidden rounded-2xl bg-stone-100 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  photos.length === 1 || (photos.length % 2 === 1 && index === 0)
                    ? 'col-span-2 aspect-[16/10]'
                    : 'aspect-[4/3]'
                }`}
                style={{ border: `1px solid ${data.theme.goldAccent}55` }}
              >
                {!failedIds[photo.id] ? (
                  <img
                    src={photo.url}
                    alt={photo.caption || `Baby & family gallery image ${index + 1}`}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedIds((prev) => ({ ...prev, [photo.id]: true }))
                    }
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-stone-200/70 text-stone-500">
                    <ImageIcon className="w-6 h-6 mb-1" aria-hidden="true" />
                    <span className="text-[11px]">{photo.caption || 'Photo'}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-2.5">
                  <span className="text-[11px] text-white font-medium line-clamp-1">
                    {photo.caption || ''}
                  </span>
                  <ZoomIn className="w-4 h-4 text-amber-200 shrink-0" aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </LuxuryCardShell>

      {/* Fullscreen Lightbox with Swipe & Keyboard Navigation */}
      <AnimatePresence>
        {activePhoto && activeIndex !== null && (
          <motion.div
            key="gallery-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReduced ? 0.1 : 0.22 }}
            onClick={close}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
              const delta = endX - touchStartX.current;
              if (delta > 45) showPrev();
              else if (delta < -45) showNext();
              touchStartX.current = null;
            }}
            className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none"
            role="dialog"
            aria-modal="true"
            aria-label="Baby and family photo lightbox"
          >
            <div className="w-full max-w-4xl flex items-center justify-between text-white/85 mb-3">
              <span className="text-xs font-medium tabular-nums">
                {activeIndex + 1} / {photos.length}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close photo preview"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className="relative w-full max-w-4xl flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label="Previous photo"
                  className="absolute left-1 sm:left-3 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <motion.img
                key={activePhoto.id}
                initial={prefersReduced ? false : { opacity: 0.4, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                src={activePhoto.url}
                alt={activePhoto.caption || 'Baby and family photograph'}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              />

              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next photo"
                  className="absolute right-1 sm:right-3 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {activePhoto.caption && (
              <p className="mt-4 text-center font-serif-display italic text-base text-amber-100 max-w-lg">
                {activePhoto.caption}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
