import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Footer from "@/components/footer"
import Header from "@/components/header"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "w4tchme",
  description: "",
  icons: {
    icon: [
      { url: "/w4tchmelogo.png" },
    ],
    apple: "/apple-icon.png",
  },
}

interface RootLayoutProps {
  children: React.ReactNode;
  nickname?: string;
}

export default function RootLayout({ children, nickname }: RootLayoutProps) {
  return (
    <html lang="en" className="bg-black text-white">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className={`${geist.className} font-sans antialiased relative`}>
        <Header nickname={nickname} />
        <main className="min-h-screen w-full flex flex-col items-center justify-center">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}