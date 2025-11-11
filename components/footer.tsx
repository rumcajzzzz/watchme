import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="fixed bottom-4 left-0 w-full flex justify-center pointer-events-none">
      <Link
        href="https://rumcajzdev.pl"
        target="_blank"
        className="flex items-center gap-2 pointer-events-auto px-4 py-2 rounded-xl bg-gray-700/10 backdrop-blur-md drop-shadow-[0_0_24px_rgba(0,0,0,0.9)]"
      >
        <Image
          src="/rumcajzdevlogowhite.png"
          alt="Logo"
          width={32}
          height={32}
          className="opacity-95 drop-shadow-[0_0_16px_rgba(0,0,0,0.9)]"
        />
        <span className="text-secondary text-s tracking-widest uppercase drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]">
          developed by rumcajzdev
        </span>
      </Link>
    </footer>
  )
}
