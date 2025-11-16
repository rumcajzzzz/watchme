import { easeOut, motion } from "framer-motion";
import React from "react";

interface AudioStepProps {
  mediaType: "gif" | "video";
  mediaUrl: string | null;
  mediaScale: number;
  audioVolume: number;
  videoScale: number;
  videoVolume: number;
  muteOriginalAudio: boolean;
  videoAudioUrl: string | null;
  videoAudioVolume: number;
  audioUrl: string | null;
  isLightBackground: boolean;
  setAudioUrl: (url: string) => void;
  setAudioVolume: (vol: number) => void;
  setMuteOriginalAudio: (mute: boolean) => void;
  setVideoAudioVolume: (vol: number) => void;
  handleAudioUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAudioKeyPress: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  handleAudioConfirm: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const AudioStep: React.FC<AudioStepProps> = ({
  mediaType,
  mediaUrl,
  mediaScale,
  audioVolume,
  videoScale,
  videoVolume,
  muteOriginalAudio,
  videoAudioUrl,
  videoAudioVolume,
  audioUrl,
  isLightBackground,
  setAudioUrl,
  setAudioVolume,
  setMuteOriginalAudio,
  setVideoAudioVolume,
  handleAudioUpload,
  handleAudioKeyPress,
  handleAudioConfirm,
  videoRef,
}) => {


  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.8, ease: easeOut }}
      className="flex flex-col items-center gap-5 sm:gap-6 z-20"
    >
      {/* MEDIA PREVIEW */}
      {mediaUrl && (
        <>
          {mediaType === "gif" && (
            <img
              src={mediaUrl}
              alt="GIF Preview"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                height: `${mediaScale}vh`,
                width: "auto",
                maxWidth: "100vw",
                objectFit: "contain",
                pointerEvents: "none",
                zIndex: 0,
                opacity: 0.15,
              }}
            />
          )}

          {mediaType === "video" && (
            <video
              ref={(el) => {
                if (el) {
                  el.volume = videoVolume / 100;
                  el.muted = muteOriginalAudio;
                  videoRef.current = el;
                }
              }}
              src={mediaUrl}
              autoPlay
              loop
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                height: `${videoScale}vh`,
                width: "auto",
                maxWidth: "100vw",
                objectFit: "contain",
                pointerEvents: "none",
                zIndex: 0,
                opacity: 0.15,
              }}
            />
          )}
        </>
      )}

      <h2
        className={`text-3xl font-extralight drop-shadow-lg tracking-[0.2em] uppercase mb-3 ${
          isLightBackground ? "text-primary" : "text-secondary"
        }`}
      >
        add audio?
      </h2>

      <div className="flex flex-col items-center gap-5 mt-3">
        <input
          type="file"
          accept=".mp3, .wav, .m4a, .ogg, .mp4"
          onChange={handleAudioUpload}
          className="hidden"
          id="audio-upload"
          key={audioUrl || "audio-input"}
        />
        <label htmlFor="audio-upload" className="cursor-pointer">
          <div
            className={`px-12 py-5 rounded-full text-base border-2 border-white/30 bg-linear-to-br from-white/10 to-white/0 hover:from-white/15 hover:to-white/5 backdrop-blur-md font-light tracking-[0.15em] uppercase transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]
              ${
                isLightBackground
                  ? "text-primary hover:text-primary hover:border-primary/70"
                  : "text-secondary hover:text-secondary hover:border-white/70"
              }
            `}
          >
            {audioUrl ? "Change Audio" : "Upload Audio"}
          </div>
        </label>

        {audioUrl && (
          <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-80">
            <p className={`text-xs font-light tracking-wider ${isLightBackground ? "text-primary" : "text-secondary"}`}>✓ Audio uploaded</p>

            <div className="w-full">
              <label className={`text-xs font-light tracking-[0.2em] uppercase block mb-2 ${isLightBackground ? "text-primary" : "text-secondary"}`}>
                Volume: {audioVolume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={audioVolume}
                onChange={(e) => setAudioVolume(Number(e.target.value))}
                className="w-full accent-white"
              />
            </div>

            <button
              type="button"
              onClick={() => setAudioUrl("")}
              className="mt-2 px-4 py-2 text-xs text-white bg-red-500 rounded-full hover:bg-red-600 transition-all"
            >
              Remove Audio
            </button>
          </div>
        )}

        {mediaType === "video" && (
          <>
            <div
              className={`text-xs font-light tracking-[0.2em] uppercase mt-6 ${
                isLightBackground ? "text-primary" : "text-secondary"
              }`}
            >
              Video audio options
            </div>

            <label className="flex items-center gap-3 cursor-pointer bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 hover:border-white/50 transition-all duration-300">
              <input
                type="checkbox"
                checked={muteOriginalAudio}
                onChange={(e) => setMuteOriginalAudio(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
              <span
                className={`text-xs font-light tracking-[0.15em] uppercase ${
                  isLightBackground ? "text-primary" : "text-secondary"
                }`}
              >
                Mute original video audio
              </span>
            </label>

            {videoAudioUrl && (
              <div className="flex flex-col items-center gap-3 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-72">
               <p className={`text-white/70 text-xs font-light tracking-wider ${
                  isLightBackground ? "text-primary" : "text-secondary"
                }`}>
                  ✓ Background audio uploaded
                </p>
                <div className="w-full">
                  <label className="text-white text-xs font-light tracking-[0.2em] uppercase block mb-2">
                    Background Volume: {videoAudioVolume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={videoAudioVolume}
                    onChange={(e) => setVideoAudioVolume(Number(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={handleAudioConfirm}
        className="group relative bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-16 py-5 text-lg rounded-full mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-light tracking-[0.2em] uppercase shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.7)] hover:scale-110 transition-all"
      >
        <span className="relative z-10">{audioUrl || videoAudioUrl ? "Next →" : "Skip →"}</span>
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-emerald-400" />
      </button>
    </motion.div>
  );
};

export default AudioStep;
