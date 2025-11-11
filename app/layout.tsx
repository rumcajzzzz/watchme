import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Footer from "@/components/footer"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "w4tchme",
  description: "Create and share visual screens — developed by rumcajzdev",
  icons: {
    icon: [
      { url: "/w4tchmelogo.png" },
      // { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-black text-white">
      <body className={`${geist.className} font-sans antialiased relative`}>
        <main className="min-h-screen w-full flex flex-col items-center justify-center">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
