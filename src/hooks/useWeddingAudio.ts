import { useCallback, useEffect, useRef, useState } from 'react';

const PREF_KEY = 'royal_nikah_music_muted';

export interface WeddingAudioState {
  hasAudio: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  autoplayBlocked: boolean;
  errorMessage: string | null;
  play: () => Promise<boolean>;
  pause: () => void;
  togglePlay: () => Promise<void>;
  toggleMute: () => void;
}

export function useWeddingAudio(audioUrl: string | null | undefined, enabled: boolean): WeddingAudioState {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PREF_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasAudio = Boolean(enabled && audioUrl && audioUrl.trim());

  useEffect(() => {
    if (!hasAudio || !audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      setIsPlaying(false);
      setAutoplayBlocked(false);
      setErrorMessage(null);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.preload = 'auto';
    audio.muted = isMuted;
    audioRef.current = audio;

    const onPlay = () => {
      setIsPlaying(!audio.paused);
      setAutoplayBlocked(false);
      setErrorMessage(null);
    };
    const onPause = () => {
      setIsPlaying(false);
    };
    const onError = () => {
      setIsPlaying(false);
      setErrorMessage('Audio track could not be loaded.');
    };
    const onVolumeChange = () => {
      setIsMuted(audio.muted);
    };

    audio.addEventListener('playing', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onPause);
    audio.addEventListener('error', onError);
    audio.addEventListener('volumechange', onVolumeChange);

    return () => {
      audio.removeEventListener('playing', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onPause);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('volumechange', onVolumeChange);
      audio.pause();
      audio.src = '';
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [audioUrl, hasAudio]);

  const play = useCallback(async (): Promise<boolean> => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return false;
    try {
      setErrorMessage(null);
      audio.muted = isMuted;
      await audio.play();
      // Only confirm playing if audio actually started and isn't paused
      const actuallyPlaying = !audio.paused;
      setIsPlaying(actuallyPlaying);
      setAutoplayBlocked(!actuallyPlaying);
      return actuallyPlaying;
    } catch (err) {
      setIsPlaying(false);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setAutoplayBlocked(true);
      } else {
        setErrorMessage('Unable to play audio track.');
      }
      return false;
    }
  }, [hasAudio, isMuted]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [isPlaying, pause, play]);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    try {
      localStorage.setItem(PREF_KEY, String(nextMuted));
    } catch {
      // ignore storage errors
    }
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  }, [isMuted]);

  return {
    hasAudio,
    isPlaying,
    isMuted,
    autoplayBlocked,
    errorMessage,
    play,
    pause,
    togglePlay,
    toggleMute,
  };
}
