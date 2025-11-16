"use client";
import { motion } from "framer-motion";

export default function UploadOverlay({ progress }: { progress: number }) {
  const rounded = Math.round(progress);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-9999 flex flex-col items-center justify-center gap-6">
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-white text-2xl font-extralight tracking-[0.3em] uppercase"
      >
        Uploading...
      </motion.div>

      <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden border border-white/20">
        <div
          className="h-full bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 transition-all duration-200 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.6)]"
          style={{ width: `${rounded}%` }}
        />
      </div>

      <div className="text-white/60 text-base font-light tracking-wider">
        {rounded}%
      </div>
    </div>
  );
}
