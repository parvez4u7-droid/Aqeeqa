import React, { useState } from 'react';
import { BackgroundSettings, ThemeSettings } from '../../types/wedding';

export const AmbientBackground: React.FC<{
  background: BackgroundSettings;
  theme: ThemeSettings;
}> = ({ background, theme }) => {
  const [videoFailed, setVideoFailed] = useState(false);

  const objectPositionClass =
    background.position === 'top'
      ? 'object-top'
      : background.position === 'bottom'
        ? 'object-bottom'
        : 'object-center';

  const fallbackImgUrl =
    background.fallbackImage?.url || background.image?.url || '';

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{
        background: `radial-gradient(circle at 50% 25%, ${theme.primaryAccent}44 0%, ${theme.canvasBg} 68%, #030a07 100%)`,
      }}
      aria-hidden="true"
    >
      {background.mode === 'video' && background.video?.url && !videoFailed && (
        <video
          key={background.video.url}
          src={background.video.url}
          poster={fallbackImgUrl || undefined}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoFailed(true)}
          className={`absolute inset-0 w-full h-full object-cover ${objectPositionClass}`}
        />
      )}

      {((background.mode === 'image' && background.image?.url) ||
        (background.mode === 'video' && (videoFailed || !background.video?.url) && fallbackImgUrl)) && (
        <img
          src={
            background.mode === 'image'
              ? background.image!.url
              : fallbackImgUrl
          }
          alt=""
          referrerPolicy="no-referrer"
          className={`absolute inset-0 w-full h-full object-cover ${objectPositionClass}`}
        />
      )}

      {/* Controlled contrast scrim */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundColor: theme.canvasBg,
          opacity: Math.min(Math.max(background.overlayOpacity ?? 0.7, 0.15), 0.94),
        }}
      />

      {/* Subtle golden atmospheric vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 15%, ${theme.goldAccent}1a 0%, transparent 60%)`,
        }}
      />
    </div>
  );
};
