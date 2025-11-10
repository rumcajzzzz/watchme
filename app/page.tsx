"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Step = "nickname" | "background" | "media" | "audio" | "settings"
type BackgroundType = "color" | "image"
type MediaType = "gif" | "video"

export default function Home() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("nickname")
  const [nickname, setNickname] = useState<string>("")
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("color")
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000")
  const [backgroundImage, setBackgroundImage] = useState<string>("")
  const [imageOpacity, setImageOpacity] = useState<number>(100)
  const [imageScale, setImageScale] = useState<number>(100)
  const [mediaUrl, setMediaUrl] = useState<string>("")
  const [mediaType, setMediaType] = useState<MediaType>("gif")
  const [videoScale, setVideoScale] = useState<number>(100)
  const [audioUrl, setAudioUrl] = useState<string>("")
  const [audioVolume, setAudioVolume] = useState<number>(50)
  const [videoAudioUrl, setVideoAudioUrl] = useState<string>("")
  const [videoAudioVolume, setVideoAudioVolume] = useState<number>(50)
  const [expiryHours, setExpiryHours] = useState<number>(24)
  const [showContent, setShowContent] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)
  const videoAudioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100)
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume / 100
    }
  }, [audioVolume])

  useEffect(() => {
    if (videoAudioRef.current) {
      videoAudioRef.current.volume = videoAudioVolume / 100
    }
  }, [videoAudioVolume])

  useEffect(() => {
    if (step === "background" && backgroundType === "color" && backgroundColor) {
      // Auto-preview color changes
    }
  }, [backgroundColor, backgroundType, step])

  const handleNicknameConfirm = () => {
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
    setShowContent(false)
    setTimeout(() => {
      setStep("audio")
      setShowContent(true)
    }, 500)
  }

  const handleAudioConfirm = () => {
    setShowContent(false)
    setTimeout(() => {
      setStep("settings")
      setShowContent(true)
    }, 500)
  }

  const handleFinalConfirm = async () => {
    setIsCreating(true)
    setLoadingProgress(0)

    try {
      const supabase = createClient()

      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const id = Math.random().toString(36).substring(2, 12)
      const expiresAt = expiryHours > 0 ? new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString() : null

      const screenData = {
        id,
        nickname: nickname || null,
        background_type: backgroundType,
        background_color: backgroundColor,
        background_image: backgroundImage,
        image_opacity: imageOpacity,
        image_scale: imageScale,
        media_url: mediaUrl,
        media_type: mediaType,
        video_scale: videoScale,
        audio_url: audioUrl || null,
        audio_volume: audioVolume,
        video_audio_url: videoAudioUrl || null,
        video_audio_volume: videoAudioVolume,
        expires_at: expiresAt,
      }

      const { error } = await supabase.from("screens").insert(screenData)

      clearInterval(progressInterval)
      setLoadingProgress(100)

      if (error) {
        console.error("[v0] Error saving to Supabase:", error)
        throw error
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push(`/view/${id}`)
    } catch (error) {
      console.error("[v0] Failed to create screen:", error)
      alert("Failed to create screen. Please try again.")
      setIsCreating(false)
      setLoadingProgress(0)
    }
  }

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

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result === "string") {
          setAudioUrl(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result === "string") {
          setVideoAudioUrl(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const getBackgroundStyle = () => {
    if (step === "nickname") return { backgroundColor: "#000000" }

    if (backgroundType === "color") {
      return { backgroundColor: backgroundColor || "#000000" }
    } else if (backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    }
    return { backgroundColor: "#000000" }
  }

  const hasBackgroundSelection =
    (backgroundType === "color" && backgroundColor.trim() !== "") ||
    (backgroundType === "image" && backgroundImage.trim() !== "")

  const hasMediaSelection = (mediaUrl || "").trim() !== ""
  const hasNickname = nickname.trim() !== ""

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center transition-all duration-700"
      style={getBackgroundStyle()}
    >
      {/* Image opacity overlay */}
      {step !== "nickname" && step !== "background" && backgroundType === "image" && backgroundImage && (
        <div
          className="absolute inset-0 bg-black transition-opacity duration-700"
          style={{ opacity: (100 - imageOpacity) / 100 }}
        />
      )}

      {/* Media display */}
      {(step === "media" || step === "audio" || step === "settings") && mediaUrl && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {mediaType === "video" ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              autoPlay
              loop
              className="object-contain transition-all duration-500"
              style={{
                maxWidth: `${videoScale}%`,
                maxHeight: `${videoScale}%`,
              }}
            />
          ) : (
            <img
              src={mediaUrl || "/placeholder.svg"}
              alt="Media"
              className="object-contain transition-all duration-500"
              style={{
                maxWidth: `${imageScale}%`,
                maxHeight: `${imageScale}%`,
              }}
            />
          )}
        </div>
      )}

      {nickname && (step === "media" || step === "audio" || step === "settings") && mediaUrl && (
        <div className="absolute top-8 left-8 z-20 text-white text-2xl font-light tracking-[0.2em] uppercase opacity-50 pointer-events-none">
          {nickname}
        </div>
      )}

      {/* Hidden audio elements */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} loop />}
      {videoAudioUrl && <audio ref={videoAudioRef} src={videoAudioUrl} loop />}

      {/* Loading overlay */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-8">
          <div className="text-white text-3xl font-extralight tracking-[0.3em] uppercase animate-pulse">
            Creating your link...
          </div>
          <div className="w-96 h-3 bg-white/10 rounded-full overflow-hidden border border-white/20">
            <div
              className="h-full bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 transition-all duration-300 ease-out rounded-full shadow-[0_0_20px_rgba(16,185,129,0.6)]"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <div className="text-white/60 text-lg font-light tracking-wider">{loadingProgress}%</div>
        </div>
      )}

      {step === "nickname" && (
        <div className={`transition-all duration-1000 ${showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-white text-4xl font-extralight tracking-[0.2em] uppercase mb-4">enter nickname</h2>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your name..."
              className="bg-white/10 text-white px-12 py-6 rounded-full text-center backdrop-blur-md border border-white/30 focus:border-white/70 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-500 text-2xl tracking-wider shadow-[0_8px_32px_rgba(0,0,0,0.3)] placeholder:text-white/30 min-w-[400px]"
              autoFocus
            />
            {hasNickname && (
              <button
                onClick={handleNicknameConfirm}
                className="group relative bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-20 py-6 text-xl rounded-full mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-light tracking-[0.2em] uppercase shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.7)] hover:scale-110 transition-all"
              >
                <span className="relative z-10">Next →</span>
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-emerald-400" />
              </button>
            )}
          </div>
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

          <div className="flex flex-col items-center gap-6 mt-4 min-h-[420px]">
            {backgroundType === "color" ? (
              <>
                <div
                  className="w-60 h-60 rounded-3xl border-4 border-white/40 shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-all duration-300"
                  style={{ backgroundColor: backgroundColor || "#000000" }}
                />
                <input
                  type="text"
                  value={backgroundColor || "#000000"}
                  onChange={(e) => setBackgroundColor(e.target.value || "#000000")}
                  className="bg-white/10 text-white px-8 py-4 rounded-full text-center backdrop-blur-md border border-white/30 focus:border-white/70 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-500 font-mono text-lg tracking-wider shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                  placeholder="#000000"
                />
              </>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  key={backgroundImage || "image-input"}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="px-16 py-6 rounded-full text-white text-lg border-2 border-white/30 hover:border-white/70 bg-linear-to-br from-white/10 to-white/0 hover:from-white/15 hover:to-white/5 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] backdrop-blur-md font-light tracking-[0.15em] uppercase">
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
                    <label className="text-white text-sm font-light tracking-[0.2em] uppercase mt-4">
                      Scale: {imageScale}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={imageScale}
                      onChange={(e) => setImageScale(Number(e.target.value))}
                      className="w-72 accent-white"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {hasBackgroundSelection && (
            <button
              type="button"
              onClick={handleBackgroundConfirm}
              className="group relative bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-20 py-6 text-xl rounded-full mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-light tracking-[0.2em] uppercase shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.7)] hover:scale-110 transition-all"
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
              <div className="px-16 py-6 rounded-full text-white text-lg border-2 border-white/30 hover:border-white/70 bg-linear-to-br from-white/10 to-white/0 hover:from-white/15 hover:to-white/5 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] backdrop-blur-md font-light tracking-[0.15em] uppercase">
                {mediaUrl ? "Change file" : `Upload ${mediaType === "gif" ? "GIF" : "Video"}`}
              </div>
            </label>
            {mediaUrl && (
              <>
                <p className="text-white/70 text-sm font-light tracking-wider animate-in fade-in duration-500">
                  ✓ File uploaded successfully
                </p>
                <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/30 shadow-[0_8px_48px_rgba(0,0,0,0.4)]">
                  <label className="text-white text-sm font-light tracking-[0.2em] uppercase">
                    {mediaType === "video" ? "Video" : "Image"} Scale: {mediaType === "video" ? videoScale : imageScale}
                    %
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={mediaType === "video" ? videoScale : imageScale}
                    onChange={(e) =>
                      mediaType === "video"
                        ? setVideoScale(Number(e.target.value))
                        : setImageScale(Number(e.target.value))
                    }
                    className="w-72 accent-white"
                  />
                </div>
              </>
            )}
          </div>

          {hasMediaSelection && (
            <button
              type="button"
              onClick={handleMediaConfirm}
              className="group relative bg-linear-to-rrom-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-20 py-6 text-xl rounded-full mt-10 animate-in fade-in slide-in-from-bottom-4 font-light tracking-[0.2em] uppercase shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.7)] hover:scale-110 transition-all duration-500"
            >
              <span className="relative z-10">Next →</span>
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-emerald-400" />
            </button>
          )}
        </div>
      )}

      {/* AUDIO STEP */}
      {step === "audio" && (
        <div
          className={`flex flex-col items-center gap-8 z-20 transition-all duration-1000 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-white text-4xl font-extralight drop-shadow-lg tracking-[0.2em] uppercase mb-4">
            add audio?
          </h2>

          <div className="flex flex-col items-center gap-6 mt-4">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
              id="audio-upload"
              key={audioUrl || "audio-input"}
            />
            <label htmlFor="audio-upload" className="cursor-pointer">
              <div className="px-16 py-6 rounded-full text-white text-lg border-2 border-white/30 hover:border-white/70 bg-linear-to-brrom-white/10 to-white/0 hover:from-white/15 hover:to-white/5 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] backdrop-blur-md font-light tracking-[0.15em] uppercase">
                {audioUrl ? "Change Audio" : "Upload Audio"}
              </div>
            </label>

            {audioUrl && (
              <div className="flex flex-col items-center gap-6 bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/30 shadow-[0_8px_48px_rgba(0,0,0,0.4)] w-96">
                <p className="text-white/70 text-sm font-light tracking-wider">✓ Audio uploaded</p>

                <div className="w-full">
                  <label className="text-white text-sm font-light tracking-[0.2em] uppercase block mb-2">
                    Volume: {audioVolume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(Number(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>
              </div>
            )}

            {mediaType === "video" && (
              <>
                <div className="text-white/40 text-sm font-light tracking-[0.2em] uppercase mt-8">
                  Optional: Add background audio to video
                </div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleVideoAudioUpload}
                  className="hidden"
                  id="video-audio-upload"
                  key={videoAudioUrl || "video-audio-input"}
                />
                <label htmlFor="video-audio-upload" className="cursor-pointer">
                  <div className="px-12 py-4 rounded-full text-white text-base border-2 border-white/20 hover:border-white/50 bg-linear-to-br from-white/5 to-white/0 hover:from-white/10 hover:to-white/0 transition-all duration-500 hover:scale-105 backdrop-blur-md font-light tracking-[0.15em] uppercase">
                    {videoAudioUrl ? "Change Video Audio" : "Add Video Audio"}
                  </div>
                </label>

                {videoAudioUrl && (
                  <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-80">
                    <p className="text-white/70 text-sm font-light tracking-wider">✓ Video audio uploaded</p>
                    <div className="w-full">
                      <label className="text-white text-sm font-light tracking-[0.2em] uppercase block mb-2">
                        Video Audio Volume: {videoAudioVolume}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={videoAudioVolume}
                        onChange={(e) => setVideoAudioVolume(Number(e.target.value))}
                        className="w-full accent-white"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleAudioConfirm}
            className="group relative bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-20 py-6 text-xl rounded-full mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-light tracking-[0.2em] uppercase shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.7)] hover:scale-110 transition-all"
          >
            <span className="relative z-10">{audioUrl || videoAudioUrl ? "Next →" : "Skip →"}</span>
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-emerald-400" />
          </button>
        </div>
      )}

      {/* SETTINGS STEP */}
      {step === "settings" && (
        <div
          className={`flex flex-col items-center gap-8 z-20 transition-all duration-1000 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-white text-4xl font-extralight drop-shadow-lg tracking-[0.2em] uppercase mb-4">
            link settings
          </h2>

          <div className="flex flex-col items-center gap-6 bg-white/10 backdrop-blur-md p-12 rounded-3xl border border-white/30 shadow-[0_8px_48px_rgba(0,0,0,0.4)]">
            <label className="text-white text-lg font-light tracking-[0.2em] uppercase">Link expires in:</label>

            <div className="flex gap-3">
              {[1, 8, 24].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setExpiryHours(hours)}
                  className={`px-10 py-5 rounded-2xl transition-all duration-500 font-light tracking-[0.15em] uppercase text-base ${
                    expiryHours === hours
                      ? "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.3)] scale-110"
                      : "text-white/60 hover:text-white/90 hover:bg-white/10 border border-white/20"
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setExpiryHours(0)}
              className={`px-10 py-4 rounded-2xl transition-all duration-500 font-light tracking-[0.15em] uppercase text-sm mt-2 ${
                expiryHours === 0
                  ? "bg-purple-500 text-white shadow-[0_8px_24px_rgba(168,85,247,0.4)]"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5 border border-white/10"
              }`}
            >
              Never expires
            </button>

            <p className="text-white/50 text-xs font-light tracking-wider mt-4 text-center max-w-sm">
              {expiryHours === 0
                ? "Link will be accessible forever"
                : `Link will be automatically deleted after ${expiryHours} hour${expiryHours > 1 ? "s" : ""}`}
            </p>
          </div>

          <button
            type="button"
            onClick={handleFinalConfirm}
            disabled={isCreating}
            className="group relative bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-20 py-6 text-xl rounded-full mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-light tracking-[0.2em] uppercase shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.7)] hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            <span className="relative z-10">Create Link →</span>
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-emerald-400" />
          </button>
        </div>
      )}
    </div>
  )
}
