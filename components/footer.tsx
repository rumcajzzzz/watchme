import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="fixed bottom-4 left-0 w-full flex justify-center pointer-events-none">
      <Link
        href="https://rumcajzdev.pl"
        target="_blank"
        className="flex items-center gap-2 pointer-events-auto"
      >
        <Image
          src="/rumcajzdevlogowhite.png"
          alt="Logo"
          width={32}
          height={32}
          className="opacity-50"
        />
        <span className="text-white text-xs font-thin tracking-widest opacity-50 uppercase">
          developed by rumcajzdev
        </span>
      </Link>
    </footer>
  )
}
