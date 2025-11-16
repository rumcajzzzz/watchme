import { useEffect, useRef } from "react";

interface MediaSyncProps {
  step: string;
  audioVolume: number;
  videoVolume: number;
  videoAudioVolume: number;
  muteOriginalAudio: boolean;
}

export function useMediaSync({
  step,
  audioVolume,
  videoVolume,
  videoAudioVolume,
  muteOriginalAudio,
}: MediaSyncProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = audioVolume / 100;
  }, [audioVolume]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = videoVolume / 100;
  }, [videoVolume]);

  useEffect(() => {
    if (videoAudioRef.current) videoAudioRef.current.volume = videoAudioVolume / 100;
  }, [videoAudioVolume]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muteOriginalAudio;
  }, [muteOriginalAudio]);

  useEffect(() => {
    if (!videoRef.current || !audioRef.current) return;

    if (step === "media" || step === "audio") {
      videoRef.current.play().catch(() => {});
      audioRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      audioRef.current.pause();
    }
  }, [step]);

  return { audioRef, videoRef, videoAudioRef };
}
