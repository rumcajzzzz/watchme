"use client";

import { easeInOut, easeOut, motion } from "framer-motion";

interface NicknameStepProps {
  nickname: string;
  setNickname: (value: string) => void;
  hasNickname: boolean;
  handleNicknameKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleNicknameConfirm: () => void;
}

const NicknameStep: React.FC<NicknameStepProps> = ({
    nickname,
    setNickname,
    hasNickname,
    handleNicknameKeyPress,
    handleNicknameConfirm
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ duration: 0.8, ease: easeOut }}
        className="flex flex-col items-center"
      >
        <h2 className="text-white text-2xl sm:text-3xl font-extralight tracking-[0.2em] uppercase mb-3 text-center">
          enter nickname
        </h2>

        <div className="flex flex-col items-center gap-6 w-full px-6">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyUp={handleNicknameKeyPress}
            placeholder="Your name..."
            className="bg-white/10 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full text-center
              backdrop-blur-md border border-white/30 focus:border-white/70
              focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-500
              text-lg sm:text-xl tracking-wider shadow-[0_8px_32px_rgba(0,0,0,0.3)]
              placeholder:text-white/30 w-full max-w-[340px]"
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: hasNickname ? 1 : 0, y: hasNickname ? 0 : 10 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-auto"
          >
            <button
              onClick={handleNicknameConfirm}
              disabled={!hasNickname}
              className="group relative bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500
                hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white
                px-12 sm:px-16 py-4 sm:py-5 text-base sm:text-lg rounded-full mt-4
                font-light tracking-[0.2em] uppercase shadow-[0_0_40px_rgba(16,185,129,0.4)]
                hover:shadow-[0_0_70px_rgba(16,185,129,0.6)] hover:scale-105 transition-all duration-500"
            >
              <span className="relative z-10">Next →</span>
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-emerald-400" />
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
};

export default NicknameStep