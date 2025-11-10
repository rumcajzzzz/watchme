"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Step = "start" | "background" | "media" | "complete"
type BackgroundType = "color" | "image"

export default function Home() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("start")
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("color")
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000")
  const [backgroundImage, setBackgroundImage] = useState<string>("")
  const [imageOpacity, setImageOpacity] = useState<number>(100)
  const [mediaUrl, setMediaUrl] = useState<string>("")
  const [mediaType, setMediaType] = useState<"gif" | "video">("gif")
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100)
  }, [])

  const handleStart = () => {
    setShowContent(false)
    setTimeout(() => {
      setStep("background")
      setShowContent(true)
    }, 500)
  }

  const handleBackgroundConfirm = () => {
    setShowContent(false)
    setTimeout(() => {
      setStep("media")
      setShowContent(true)
    }, 500)
  }

  const handleMediaConfirm = () => {
    const screenData = {
      backgroundType,
      backgroundColor,
      backgroundImage,
      imageOpacity,
      mediaUrl,
      mediaType,
    };
  
    // Generate short 10-character ID
    const id = Math.random().toString(36).substring(2, 12);
  
    // Save data in localStorage
    localStorage.setItem(`screenData-${id}`, JSON.stringify(screenData));
  
    // Navigate to short URL
    router.push(`/view/${id}`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result === "string") {
          setBackgroundImage(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result === "string") {
          setMediaUrl(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const getBackgroundStyle = () => {
    if (step === "start" || step === "background") return { backgroundColor: "#000000" }

    if (backgroundType === "color") {
      return { backgroundColor: backgroundColor || "#000000" }
    } else if (backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative" as const,
      }
    }
    return { backgroundColor: "#000000" }
  }

  const hasBackgroundSelection =
    (backgroundType === "color" && backgroundColor.trim() !== "") ||
    (backgroundType === "image" && backgroundImage.trim() !== "")

  const hasMediaSelection = (mediaUrl || "").trim() !== ""

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center transition-all duration-700"
      style={getBackgroundStyle()}
    >
      {/* Image opacity overlay */}
      {step !== "start" && step !== "background" && backgroundType === "image" && backgroundImage && (
        <div
          className="absolute inset-0 bg-black transition-opacity duration-700"
          style={{ opacity: (100 - imageOpacity) / 100 }}
        />
      )}

      {/* Media display */}
      {(step === "media" || step === "complete") && mediaUrl && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {mediaType === "video" ? (
            <video src={mediaUrl} autoPlay loop muted className="max-w-full max-h-full" />
          ) : (
            <img
              src={mediaUrl || "/placeholder.svg"}
              alt="Media"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      )}

      {/* START STEP */}
      {step === "start" && (
        <div className={`transition-all duration-1000 ${showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          <button
            onClick={handleStart}
            className="group relative text-white text-4xl px-20 py-10 rounded-full bg-gradient-to-br from-white/5 to-white/0 border-2 border-white/30 hover:border-white/70 transition-all duration-700 hover:scale-110 hover:shadow-[0_0_60px_rgba(255,255,255,0.4),inset_0_0_30px_rgba(255,255,255,0.1)] backdrop-blur-md font-extralight tracking-[0.3em] uppercase"
          >
            <span className="relative z-10">start?</span>
            <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/5 transition-all duration-700" />
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl bg-white/20" />
          </button>
        </div>
      )}

      {/* BACKGROUND STEP */}
      {step === "background" && (
        <div
          className={`flex flex-col items-center gap-8 z-20 transition-all duration-1000 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-white text-4xl font-extralight tracking-[0.2em] uppercase mb-4">what background?</h2>

          <div className="flex gap-2 p-2 bg-white/5 rounded-full backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <button
              type="button"
              onClick={() => setBackgroundType("color")}
              className={`px-12 py-4 rounded-full transition-all duration-500 font-light tracking-[0.15em] uppercase text-sm ${
                backgroundType === "color"
                  ? "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.3)]"
                  : "text-white/60 hover:text-white/90 hover:bg-white/10"
              }`}
            >
              Color
            </button>
            <button
              type="button"
              onClick={() => setBackgroundType("image")}
              className={`px-12 py-4 rounded-full transition-all duration-500 font-light tracking-[0.15em] uppercase text-sm ${
                backgroundType === "image"
                  ? "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.3)]"
                  : "text-white/60 hover:text-white/90 hover:bg-white/10"
              }`}
            >
              Image
            </button>
          </div>

          {backgroundType === "color" ? (
            <div className="flex flex-col items-center gap-6 mt-4">
              <input
                type="color"
                value={backgroundColor || "#000000"}
                onChange={(e) => setBackgroundColor(e.target.value || "#000000")}
                className="w-40 h-40 rounded-full cursor-pointer border-4 border-white/40 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-110 hover:border-white/70 transition-all duration-500"
              />
              <input
                type="text"
                value={backgroundColor || "#000000"}
                onChange={(e) => setBackgroundColor(e.target.value || "#000000")}
                className="bg-white/10 text-white px-8 py-4 rounded-full text-center backdrop-blur-md border border-white/30 focus:border-white/70 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-500 font-mono text-lg tracking-wider shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                placeholder="#000000"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 mt-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                key={backgroundImage || "image-input"}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="px-16 py-6 rounded-full text-white text-lg border-2 border-white/30 hover:border-white/70 bg-gradient-to-br from-white/10 to-white/0 hover:from-white/15 hover:to-white/5 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] backdrop-blur-md font-light tracking-[0.15em] uppercase">
                  Upload Image
                </div>
              </label>

              {backgroundImage && (
                <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/30 shadow-[0_8px_48px_rgba(0,0,0,0.4)]">
                  <label className="text-white text-sm font-light tracking-[0.2em] uppercase">
                    Opacity: {imageOpacity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={imageOpacity}
                    onChange={(e) => setImageOpacity(Number(e.target.value))}
                    className="w-72 accent-white"
                  />
                </div>
              )}
            </div>
          )}

          {hasBackgroundSelection && (
            <button
              type="button"
              onClick={handleBackgroundConfirm}
              className="group relative bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-20 py-6 text-xl rounded-full mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-light tracking-[0.2em] uppercase shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.7)] hover:scale-110 transition-all duration-500"
            >
              <span className="relative z-10">Next →</span>
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-emerald-400" />
            </button>
          )}
        </div>
      )}

      {/* MEDIA STEP */}
      {step === "media" && (
        <div
          className={`flex flex-col items-center gap-8 z-20 transition-all duration-1000 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-white text-4xl font-extralight drop-shadow-lg tracking-[0.2em] uppercase mb-4">
            add media?
          </h2>

          <div className="flex gap-2 p-2 bg-white/5 rounded-full backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <button
              type="button"
              onClick={() => setMediaType("gif")}
              className={`px-12 py-4 rounded-full transition-all duration-500 font-light tracking-[0.15em] uppercase text-sm ${
                mediaType === "gif"
                  ? "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.3)]"
                  : "text-white/60 hover:text-white/90 hover:bg-white/10"
              }`}
            >
              GIF
            </button>
            <button
              type="button"
              onClick={() => setMediaType("video")}
              className={`px-12 py-4 rounded-full transition-all duration-500 font-light tracking-[0.15em] uppercase text-sm ${
                mediaType === "video"
                  ? "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.3)]"
                  : "text-white/60 hover:text-white/90 hover:bg-white/10"
              }`}
            >
              Video
            </button>
          </div>

          <div className="flex flex-col items-center gap-6 mt-4">
            <input
              type="file"
              accept={mediaType === "video" ? "video/*" : "image/gif"}
              onChange={handleMediaUpload}
              className="hidden"
              id="media-upload"
              key={mediaUrl || "media-input"}
            />
            <label htmlFor="media-upload" className="cursor-pointer">
              <div className="px-16 py-6 rounded-full text-white text-lg border-2 border-white/30 hover:border-white/70 bg-gradient-to-br from-white/10 to-white/0 hover:from-white/15 hover:to-white/5 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] backdrop-blur-md font-light tracking-[0.15em] uppercase">
                {mediaUrl ? "Change file" : `Upload ${mediaType === "gif" ? "GIF" : "Video"}`}
              </div>
            </label>
            {mediaUrl && (
              <p className="text-white/70 text-sm font-light tracking-wider animate-in fade-in duration-500">
                ✓ File uploaded successfully
              </p>
            )}
          </div>

          {hasMediaSelection && (
            <button
              type="button"
              onClick={handleMediaConfirm}
              className="group relative bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-20 py-6 text-xl rounded-full mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-light tracking-[0.2em] uppercase shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.7)] hover:scale-110 transition-all duration-500"
            >
              <span className="relative z-10">Create →</span>
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-emerald-400" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
