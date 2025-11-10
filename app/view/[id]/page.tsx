"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"

interface ScreenData {
  backgroundType: "color" | "image"
  backgroundColor: string
  backgroundImage: string
  imageOpacity: number
  mediaUrl: string
  mediaType: "gif" | "video"
}

export default function ViewScreen() {
  const params = useParams()
  const [screenData, setScreenData] = useState<ScreenData | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (params.id) {
      try {
        const decoded = JSON.parse(atob(params.id as string))
        setScreenData(decoded)
      } catch (error) {
        console.error("[v0] Failed to decode screen data:", error)
      }
    }
  }, [params.id])

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!screenData) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  const getBackgroundStyle = () => {
    if (screenData.backgroundType === "color") {
      return { backgroundColor: screenData.backgroundColor }
    } else if (screenData.backgroundImage) {
      return {
        backgroundImage: `url(${screenData.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    }
    return { backgroundColor: "#000000" }
  }

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center"
      style={getBackgroundStyle()}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Image opacity overlay */}
      {screenData.backgroundType === "image" && screenData.backgroundImage && (
        <div className="absolute inset-0 bg-black" style={{ opacity: (100 - screenData.imageOpacity) / 100 }} />
      )}

      {/* Media display */}
      {screenData.mediaUrl && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {screenData.mediaType === "video" ? (
            <video src={screenData.mediaUrl} autoPlay loop muted playsInline className="max-w-full max-h-full" />
          ) : (
            <img
              src={screenData.mediaUrl || "/placeholder.svg"}
              alt="Media"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      )}

      {/* Share controls */}
      <div
        className={`fixed top-8 right-8 z-50 transition-all duration-500 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <Button
          onClick={handleCopyLink}
          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 rounded-full gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Share
            </>
          )}
        </Button>
      </div>

      {/* Create your own button */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <Button
          onClick={() => (window.location.href = "/")}
          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 rounded-full"
        >
          Create your own
        </Button>
      </div>
    </div>
  )
}
