"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export default function Footer() {
  const pathname = usePathname()
  if (pathname.startsWith("/view/")) return null

  return (
    <footer className="fixed bottom-4 left-0 w-full flex justify-center pointer-events-none">
      <Link
        href="https://rumcajzdev.pl"
        target="_blank"
        className="flex items-center gap-1 pointer-events-auto px-2 py-1 rounded-lg bg-gray-700/10 backdrop-blur-md drop-shadow-[0_0_24px_rgba(0,0,0,0.9)] sm:px-4 sm:py-2 sm:gap-2 sm:rounded-xl"
      >
        <Image
          src="/rumcajzdevlogowhite.png"
          alt="Logo"
          width={18} 
          height={18}
          className="opacity-95 drop-shadow-[0_0_16px_rgba(0,0,0,0.9)] sm:w-6 sm:h-6"
        />
        <span 
          // Zmniejszony rozmiar tekstu na małych ekranach (np. 'xs' zamiast 's')
          className="text-secondary text-xs tracking-widest uppercase drop-shadow-[0_0_20px_rgba(0,0,0,0.9)] sm:text-sm"
        >
          developed by rumcajzdev
        </span>
      </Link>
    </footer>
  )
}