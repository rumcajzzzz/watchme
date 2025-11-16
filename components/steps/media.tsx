"use client";
import { easeOut, motion } from "framer-motion";
import { useEffect, useRef } from "react";

export interface MediaStepProps {
  mediaType: "gif" | "video";
  setMediaType: (t: "gif" | "video") => void;

  mediaUrl: string | null;
  handleMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;

  mediaScale: number;
  setMediaScale: (n: number) => void;

  videoScale: number;
  setVideoScale: (n: number) => void;

  videoVolume: number;
  setVideoVolume: (n: number) => void;

  handleMediaKeyPress: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  handleMediaConfirm: () => void;

  hasMediaSelection: boolean;
  isLightBackground: boolean;
}

export default function MediaStep({
  mediaType,
  setMediaType,
  mediaUrl,
  handleMediaUpload,
  mediaScale,
  setMediaScale,
  videoScale,
  setVideoScale,
  videoVolume,
  setVideoVolume,
  handleMediaKeyPress,
  handleMediaConfirm,
  hasMediaSelection,
  isLightBackground,
}: MediaStepProps) {

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = videoVolume / 100; // 0-1
    }
  }, [mediaType, videoVolume, mediaUrl]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.8, ease: easeOut }}
      className="flex flex-col items-center gap-6 z-20"
      onKeyPress={handleMediaKeyPress}
      tabIndex={0}
     >
      <h2
        className={`text-3xl font-extralight drop-shadow-lg tracking-[0.2em] uppercase mb-3 ${
          isLightBackground ? "text-primary" : "text-secondary"
        }`}
      >
        add media?
      </h2>

      {/* SWITCH GIF / VIDEO */}
      <div className="flex gap-2 p-1.5 bg-white/5 rounded-full backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <button
          type="button"
          onClick={() => setMediaType("gif")}
          className={`px-6 sm:px-10 py-2 sm:py-3 rounded-full font-light tracking-[0.15em] uppercase text-[10px] sm:text-xs transition-all duration-300 ${mediaType !== "gif" ? "hover:opacity-50" : ""} ${
            mediaType === "gif" 
            ? "bg-white text-primary shadow-lg shadow-white/50"
            : isLightBackground ? "text-primary" : "text-secondary" 
          } ${isLightBackground && mediaType === "gif" ? "bg-black! text-secondary" : ""}`}
         >
          GIF
        </button>
        <button
          type="button"
          onClick={() => setMediaType("video")}
          className={`px-6 sm:px-10 py-2 sm:py-3 rounded-full font-light tracking-[0.15em] uppercase text-[10px] sm:text-xs transition-all duration-300 ${mediaType !== "video" ? "hover:opacity-50" : ""} ${
            mediaType === "video" 
            ? "bg-white text-primary shadow-lg shadow-white/50"
            : isLightBackground ? "text-primary" : "text-secondary" 
          } ${isLightBackground && mediaType === "video" ? "bg-black! text-secondary" : ""}`}
         >
        
          Video
        </button>
      </div>

      {/* UPLOAD */}
      <div className="flex flex-col items-center gap-5 mt-3">
        <input
          type="file"
          accept={mediaType === "video" ? "video/*" : "image/gif"}
          onChange={handleMediaUpload}
          className="hidden"
          id="media-upload"
          key={mediaUrl || "media-input"}
        />

        <label htmlFor="media-upload" className="cursor-pointer">
          <div
            className={`px-12 py-5 rounded-full transition-all duration-500 font-light tracking-[0.15em] uppercase text-base backdrop-blur-md border ${
              isLightBackground
                ? "bg-white/5 border-black/20 text-black/80 hover:bg-black/20 hover:text-black"
                : "bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
            } hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]`}
          >
            {mediaUrl ? "Change file" : `Upload ${mediaType === "gif" ? "GIF" : "Video"}`}
          </div>
        </label>

        {/* PREVIEW */}
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
                  zIndex: -2,
                  opacity: 0.8,
                }}
              />
            )}

            {mediaType === "video" && (
              <video
                ref={videoRef}
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

        <span
          className={`${
            isLightBackground ? "text-primary" : "text-secondary"
          } text-xs block`}
        >
          Max file size: 50MB
        </span>

        {/* SETTINGS AFTER UPLOAD */}
        {mediaUrl && (
          <>
            <p
              className={`text-xs font-light tracking-wider animate-in fade-in duration-500 ${
                isLightBackground ? "text-primary" : "text-secondary"
              }`}
            >
              ✓ File uploaded successfully
            </p>

            {/* SCALE BOX */}
            <div className="flex flex-col items-center gap-3 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/30 shadow-[0_8px_48px_rgba(0,0,0,0.4)]">
              <label
                className={`${
                  isLightBackground ? "text-primary" : "text-secondary"
                } text-xs font-light tracking-[0.2em] uppercase`}
              >
                {mediaType === "video" ? "Video" : "Image"} Scale:{" "}
                {mediaType === "video" ? videoScale : mediaScale}%
              </label>

              <input
                type="range"
                min="10"
                max="200"
                value={mediaType === "video" ? videoScale : mediaScale}
                onChange={(e) =>
                  mediaType === "video"
                    ? setVideoScale(Number(e.target.value))
                    : setMediaScale(Number(e.target.value))
                }
                className="w-60 accent-white"
              />

              {/* VIDEO VOLUME */}
              {mediaType === "video" && mediaUrl && (
                <div
                  className={`flex flex-col items-center gap-3 mt-4 p-6 rounded-2xl w-72 backdrop-blur-md transition-all duration-500 ${
                    isLightBackground
                      ? "bg-black/10 border border-black/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                      : "bg-white/10 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                  }`}
                >
                  <label
                    className={`${
                      isLightBackground ? "text-primary" : "text-secondary"
                    } text-xs font-light tracking-[0.2em] uppercase block mb-1`}
                  >
                    Original Video Volume: {videoVolume}%
                  </label>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={videoVolume}
                    onChange={(e) => setVideoVolume(Number(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* NEXT BUTTON */}
      {hasMediaSelection && (
        <button
          type="button"
          onClick={handleMediaConfirm}
          className="group relative bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-16 py-5 text-lg rounded-full mt-6 animate-in fade-in slide-in-from-bottom-4 font-light tracking-[0.2em] uppercase shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.7)] hover:scale-110 transition-all duration-500"
        >
          <span className="relative z-10">Next →</span>
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-emerald-400" />
        </button>
      )}
    </motion.div>
  );
}
