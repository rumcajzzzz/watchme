"use client";

import React from "react";
import { AnimatePresence, easeOut, motion } from "framer-motion";

interface BackgroundStepProps {
  backgroundType: "color" | "image";
  setBackgroundType: (type: "color" | "image") => void;

  backgroundColor: string;
  setBackgroundColor: (color: string) => void;

  backgroundImage: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;

  colorInputRef: React.RefObject<HTMLInputElement | null>;

  handleHexChange: (value: string) => void;

  imageOpacity: number;
  setImageOpacity: (value: number) => void;

  imageScale: number;
  setImageScale: (value: number) => void;

  hasBackgroundSelection: boolean;
  handleBackgroundConfirm: () => void;

  isLightBackground: boolean;
}

const BackgroundStep: React.FC<BackgroundStepProps> = ({
  backgroundType,
  setBackgroundType,
  backgroundColor,
  setBackgroundColor,
  backgroundImage,
  handleImageUpload,
  colorInputRef,
  handleHexChange,
  imageOpacity,
  setImageOpacity,
  imageScale,
  setImageScale,
  hasBackgroundSelection,
  handleBackgroundConfirm,
  isLightBackground,
}) => {

  const variants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.8, ease: easeOut }}
      className="flex flex-col items-center gap-5 sm:gap-6 z-20  min-h-[45vh]"
     >
      <h1
        className={`text-2xl sm:text-3xl font-extralight tracking-[0.2em] uppercase mb-2 sm:mb-3 text-center transition-all duration-1000 ${
          isLightBackground ? "text-primary" : "text-secondary"
        }`}
       >
        background?
      </h1>

      {/* TYPE SWITCH */}
      <div className="flex gap-2 p-1.5 bg-white/5 rounded-full backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <button
          type="button"
          onClick={() => setBackgroundType("color")}
          className={`px-6 sm:px-10 py-2 sm:py-3 rounded-full font-light tracking-[0.15em] uppercase text-[10px] sm:text-xs transition-all duration-300 ${
               backgroundType === "color" 
               ? "bg-white text-primary shadow-lg shadow-white/50"
               : isLightBackground ? "text-primary" : "text-secondary" 
          } ${isLightBackground ? "invert" : ""}`}
        >
          Color
        </button>

        <button
          type="button"
          onClick={() => {
            setBackgroundType("image");
            setBackgroundColor("#000000");
          }}
          className={`px-6 sm:px-10 py-2 sm:py-3 rounded-full font-light tracking-[0.15em] uppercase text-[10px] sm:text-xs transition-all duration-300 ${
               backgroundType === "image" 
               ? "bg-white text-primary shadow-lg shadow-white/50"
               : isLightBackground ? "text-primary" : "text-secondary"
          }`}
        >
          Image
        </button>
      </div>

      {/* OPTIONS */}
      <div className="flex flex-col items-center gap-5 mt-3 w-full px-4 transition-all duration-500">
            <AnimatePresence mode="wait">
        {backgroundType === "color" ? (
        <motion.div
              key="color-options"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-5 w-full"
            >
          <div
          onClick={() => colorInputRef?.current?.click()}
          className="w-36 sm:w-48 h-36 sm:h-48 rounded-2xl shadow-[0_0_40px_rgba(128,128,128,0.5)] transition-all duration-500 cursor-pointer hover:scale-105"
          style={{ backgroundColor: backgroundColor || "#000000" }}
          />

          <input
          type="text"
          value={backgroundColor || "#000000"}
          onChange={(e) => handleHexChange(e.target.value)}
          className={`bg-white/10 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-center backdrop-blur-md border border-white/30 focus:border-white/70 focus:outline-none focus:ring-4 focus:ring-white/20 transition-colors duration-500 font-mono text-sm sm:text-base tracking-wider shadow-[0_8px_32px_rgba(0,0,0,0.3)] w-40 sm:w-48 ${
            isLightBackground ? "text-primary" : "text-secondary"
          }`}
          placeholder="#000000"
          />

          <input
          ref={colorInputRef}
          type="color"
          value={backgroundColor || "#000000"}
          onChange={(e) => setBackgroundColor(e.target.value)}
          className="opacity-0 w-0 h-0 absolute"
          />
        </motion.div>
        ) : (
          <motion.div
              key="image-options"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-5 w-full"
          >
          <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
          key={backgroundImage || "image-input"}
          />

          <label htmlFor="image-upload" className="cursor-pointer">
          <div className="px-8 sm:px-12 py-4 sm:py-5 rounded-full text-white text-sm sm:text-base border-2 border-white/30 hover:border-white/70 bg-linear-to-br from-white/10 to-white/0 hover:from-white/15 hover:to-white/5 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] backdrop-blur-md font-light tracking-[0.15em] uppercase text-center">
            Upload Image
          </div>
          </label>

          {backgroundImage && (
          <div
            className={`flex flex-col items-center gap-3 p-5 sm:p-8 rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.4)] w-[90%] max-w-[320px] sm:max-w-none ${
            isLightBackground ? "bg-white/30 border-black/10" : "bg-black/80 border-white/10"
            }`}
          >
            <label className="text-white text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase">
            Opacity: {imageOpacity}%
            </label>

            <input
            type="range"
            min="0"
            max="100"
            value={imageOpacity}
            onChange={(e) => setImageOpacity(Number(e.target.value))}
            className="w-full sm:w-60 accent-white"
            />

            <label className="text-white text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase mt-3">
            Scale: {imageScale}%
            </label>

            <input
            type="range"
            min="10"
            max="200"
            value={imageScale}
            onChange={(e) => setImageScale(Number(e.target.value))}
            className="w-full sm:w-60 accent-white"
            />
          </div>
          )}
        </motion.div>
        )}

        {/* NEXT BUTTON */}
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className={`transition-all ease-out mt-4 sm:mt-6 ${
            hasBackgroundSelection
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
          >
          <button
            type="button"
            onClick={handleBackgroundConfirm}
            className="group relative bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-10 sm:px-16 py-4 sm:py-5 text-sm sm:text-lg rounded-full font-light tracking-[0.2em] uppercase shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:shadow-[0_0_70px_rgba(16,185,129,0.7)] hover:scale-105 transition-all duration-500"
          >
            <span className="relative z-10">Next →</span>
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-emerald-400" />
          </button>
        </motion.div>

        </AnimatePresence>
      </div>

    </motion.div>
  );
};

export default BackgroundStep;
