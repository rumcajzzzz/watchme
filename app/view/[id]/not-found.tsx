import Link from "next/link"

export default function NotFound() {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-8 text-white">
        <h1 className="text-6xl font-extralight tracking-[0.3em] uppercase">404</h1>
        <p className="text-2xl font-light tracking-[0.2em] uppercase text-white/70">Screen not found</p>
        <Link
          href="/"
          className="group relative text-white text-xl px-16 py-6 rounded-full bg-gradient-to-br from-white/5 to-white/0 border-2 border-white/30 hover:border-white/70 transition-all duration-700 hover:scale-110 hover:shadow-[0_0_60px_rgba(255,255,255,0.4),inset_0_0_30px_rgba(255,255,255,0.1)] backdrop-blur-md font-light tracking-[0.2em] uppercase"
        >
          <span className="relative z-10">Create New</span>
          <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/5 transition-all duration-700" />
        </Link>
      </div>
    </div>
  )
}
