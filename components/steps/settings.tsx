import { easeOut, motion } from "framer-motion";
import React from "react";

interface SettingsStepProps {
  isLightBackground: boolean;
  mediaType: "gif" | "video";
  expiryHours: number;
  setExpiryHours: (h: number) => void;
  showVideoControls: boolean;
  setShowVideoControls: (x: boolean) => void;
  handleSettingsKeyPress: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  handleFinalConfirm: () => void;
  isCreating: boolean;
}

const SettingsStep: React.FC<SettingsStepProps> = ({
  isLightBackground,
  mediaType,
  expiryHours,
  setExpiryHours,
  showVideoControls,
  setShowVideoControls,
  handleSettingsKeyPress,
  handleFinalConfirm,
  isCreating,
}) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.8, ease: easeOut }}
      className="flex flex-col items-center gap-5 sm:gap-6 z-20"
    >
      <h2
        className={`text-3xl font-extralight drop-shadow-lg tracking-[0.2em] uppercase mb-3 ${
          isLightBackground ? "text-primary" : "text-secondary"
        }`}
      >
        link settings
      </h2>

      {/* EXPIRY SETTINGS */}
      <div className="flex flex-col items-center gap-5 bg-white/10 backdrop-blur-md p-10 rounded-2xl border border-white/30 shadow-[0_8px_48px_rgba(0,0,0,0.4)]">
        <label
          className={`${
            isLightBackground ? "text-primary" : "text-secondary"
          } text-base font-light tracking-[0.2em] uppercase`}
        >
          Link expires in:
        </label>

        <div className="flex gap-2">
          {[1, 8, 24].map((hours) => (
            <button
              key={hours}
              type="button"
              onClick={() => setExpiryHours(hours)}
              className={`px-8 py-4 rounded-xl transition-all duration-500 font-light tracking-[0.15em] uppercase text-sm ${
                expiryHours === hours
                  ? `${
                      isLightBackground
                        ? "bg-primary text-white shadow-[0_8px_24px_rgba(0,0,0,0.3)] scale-110"
                        : "bg-secondary text-black shadow-[0_8px_24px_rgba(255,255,255,0.3)] scale-110"
                    }`
                  : `${
                      isLightBackground
                        ? "text-primary/90 hover:text-primary hover:bg-black/10 border border-secondary/40"
                        : "text-secondary/90 hover:text-secondary hover:bg-white/10 border border-white/20"
                    }`
              }`}
            >
              {hours}h
            </button>
          ))}
        </div>

        <p
          className={`${
            isLightBackground ? "text-primary" : "text-secondary"
          } text-xs font-light tracking-wider mt-3 text-center max-w-sm`}
        >
          {expiryHours === 0
            ? "Link will be accessible forever"
            : `Link will be automatically deleted after ${expiryHours} hour${
                expiryHours > 1 ? "s" : ""
              }`}
        </p>
      </div>

      {/* VIDEO CONTROLS SETTINGS */}
      {mediaType === "video" && (
        <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/30 shadow-[0_8px_48px_rgba(0,0,0,0.4)]">
          <label
            className={`${
              isLightBackground ? "text-primary" : "text-secondary"
            } text-base font-light tracking-[0.2em] uppercase`}
          >
            Video playback:
          </label>

          <label className="flex items-center gap-3 cursor-pointer bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 hover:border-white/50 transition-all duration-300">
            <input
              type="checkbox"
              checked={showVideoControls}
              onChange={(e) => setShowVideoControls(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
            <span
              className={`${
                isLightBackground ? "text-primary" : "text-secondary"
              } text-xs font-light tracking-[0.15em] uppercase`}
            >
              Allow viewers to control video
            </span>
          </label>

          <p
            className={`text-xs font-light tracking-wider text-center max-w-sm ${
              isLightBackground ? "text-primary/70" : "text-secondary/70"
            }`}
          >
            {showVideoControls
              ? "Viewers can pause, play, and scrub through the video"
              : "Video will loop automatically without controls"}
          </p>
        </div>
      )}

      {/* FINAL BUTTON */}
      <button
        type="button"
        onClick={handleFinalConfirm}
        disabled={isCreating}
        className="group relative bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-16 py-5 text-lg rounded-full mt-6 animate-in fade-in slide-in-from-bottom-4 font-light tracking-[0.2em] uppercase shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.7)] hover:scale-110 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
      >
        <span className="relative z-10">Create Link →</span>
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-emerald-400" />
      </button>
    </motion.div>
  );
};

export default SettingsStep;
