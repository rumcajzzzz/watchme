"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import tinycolor from "tinycolor2"

const supabase = createClient()

async function uploadToSupabase(file: File, folder = "media"): Promise<string> {
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage.from(folder).upload(filePath, file)
    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      throw uploadError
    }
    console.log("Upload data:", uploadData)

    const { data } = supabase.storage.from(folder).getPublicUrl(filePath)
    if (!data?.publicUrl) throw new Error("No public URL returned")
    return data.publicUrl
  } catch (err) {
    console.error("Upload failed in uploadToSupabase:", err)
    throw err
  }
}

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
  const [showVideoControls, setShowVideoControls] = useState<boolean>(false)
  const [audioUrl, setAudioUrl] = useState<string>("")
  const [audioVolume, setAudioVolume] = useState<number>(50)
  const [videoAudioUrl, setVideoAudioUrl] = useState<string>("")
  const [videoAudioVolume, setVideoAudioVolume] = useState<number>(50)
  const [muteOriginalAudio, setMuteOriginalAudio] = useState<boolean>(false)
  const [expiryHours, setExpiryHours] = useState<number>(1)
  const [showContent, setShowContent] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [videoVolume, setVideoVolume] = useState<number>(100)
  const [mediaScale, setMediaScale] = useState<number>(100)
  const [screenId, setScreenId] = useState<string>("")

  const audioRef = useRef<HTMLAudioElement>(null)
  const videoAudioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100)
  }, [])
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume / 100
    }
  }, [audioVolume])
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = videoVolume / 100
    }
  }, [videoVolume])
  useEffect(() => {
    if (videoAudioRef.current) {
      videoAudioRef.current.volume = videoAudioVolume / 100
    }
  }, [videoAudioVolume])
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muteOriginalAudio
    }
  }, [muteOriginalAudio])
  useEffect(() => {
    if (videoRef.current) {
      if (step === "media" || step === "audio") {
        videoRef.current.play().catch(() => {})
        videoRef.current.volume = videoVolume / 100
        videoRef.current.muted = muteOriginalAudio
      } else {
        videoRef.current.pause()
      }
    }
  }, [step, videoVolume, muteOriginalAudio])
  useEffect(() => {
    if (audioRef.current) {
      if (step === "audio") {
        audioRef.current.play().catch(() => {})
        audioRef.current.volume = audioVolume / 100
      } else {
        audioRef.current.pause()
      }
    }
  }, [step, audioVolume])


  const handleNicknameConfirm = () => {
    setShowContent(false)
    setTimeout(() => {
      setStep("background")
      setShowContent(true)
    }, 500)
  }
  const handleNicknameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && nickname.trim() !== "") {
      handleNicknameConfirm()
    }
  }
  const handleBackgroundConfirm = () => {
    setShowContent(false)
    setTimeout(() => {
      setStep("media")
      setShowContent(true)
    }, 500)
  }
  const handleHexKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && hasBackgroundSelection) {
      handleBackgroundConfirm()
    }
  }
  const handleMediaKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && hasMediaSelection) {
      handleMediaConfirm()
    }
  }
  const handleMediaConfirm = () => {
    setVideoAudioVolume(videoVolume);
    setShowContent(false);
    setTimeout(() => {
      setStep("audio");
      setShowContent(true);
    }, 500);
  };
  const handleAudioKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAudioConfirm()
    }
  }
  const handleAudioConfirm = () => {
    setShowContent(false)
    setTimeout(() => {
      setStep("settings")
      setShowContent(true)
    }, 500)
  }
  const handleSettingsKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isCreating) {
      handleFinalConfirm()
    }
  }
  const compressVideo = async (file: File): Promise<Blob> => {
    const maxSize = 15 * 1024 * 1024 
    if (file.size <= maxSize) {
      return file
    }
    console.log("[v0] Video file is over 15MB, compression recommended")
    return file
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
        media_scale: mediaScale, 
        video_scale: videoScale,
        show_video_controls: showVideoControls,
        audio_url: audioUrl || null,
        audio_volume: audioVolume,
        video_audio_url: videoAudioUrl || null,
        video_audio_volume: videoAudioVolume,
        mute_original_audio: muteOriginalAudio,
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
  
  const MAX_FILE_SIZE = 45 * 1024 * 1024 
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
  
    try {
      const url = await uploadToSupabase(file, "backgrounds")
      setBackgroundImage(url)
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Failed to upload image.")
    }
  }
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
  
    if (file.size > MAX_FILE_SIZE) {
      alert("File is too big! Maximum allowed size is 50MB.")
      return
    }
  
    try {
      const compressedBlob = await compressVideo(file)
      const compressedFile = new File([compressedBlob], file.name, { type: file.type, lastModified: Date.now() })
      const url = await uploadToSupabase(compressedFile, "media")
      setMediaUrl(url)
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Failed to upload media.")
    }
  }
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
  
    try {
      const url = await uploadToSupabase(file, "audio")
      setAudioUrl(url)
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Failed to upload audio.")
    }
  }
  const handleHexChange = (value: string) => {
    let normalizedValue = value.trim()
    // If user types without #, add it
    if (normalizedValue && !normalizedValue.startsWith("#")) {
      normalizedValue = "#" + normalizedValue
    }
    setBackgroundColor(normalizedValue || "#000000")
  }
  const getBackgroundStyle = () => {
    if (step === "nickname") return { backgroundColor: "#000000" }
  
    if (backgroundType === "color") {
      return { backgroundColor: backgroundColor || "#000000" }
    }
    return { backgroundColor: "#000000" }
  }

  const hasBackgroundSelection =
    (backgroundType === "color" && backgroundColor.trim() !== "") ||
    (backgroundType === "image" && backgroundImage.trim() !== "")

  const hasMediaSelection = (mediaUrl || "").trim() !== ""
  const hasNickname = nickname.trim() !== ""
  const isLightBackground = tinycolor(backgroundColor).isLight();

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center transition-all duration-700"
      style={getBackgroundStyle()}
    >
      {backgroundType === "image" && backgroundImage && (
          <img
            src={backgroundImage}
            alt="Background"
            className="absolute top-1/2 left-1/2 pointer-events-none transition-all duration-300"
            style={{
              opacity: imageOpacity / 100,
              transform: "translate(-50%, -50%)",
              height: `${imageScale}vh`,
              width: "auto",
              maxWidth: "200vw",         
              objectFit: "contain",  
            }}
          />
        )}

        {/* Media display */}
        {/* {(step === "audio" || step === "settings") && mediaUrl && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            {mediaType === "video" ? (
              <video
                src={mediaUrl}
                playsInline
                controls={false}
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
                className="pointer-events-none select-none object-contain max-h-[80vh]"
                tabIndex={-1}
              />
            ) : (
              <img
                src={mediaUrl}
                alt=""
                draggable={false}
                className="pointer-events-none select-none object-contain max-h-[80vh]"
              />
            )}
          </div>
        )} */}

        {/* {nickname && step != "nickname" && (
          <div className="absolute top-15 w-full text-center text-white text-xs font-light tracking-[0.2em] uppercase">
            {nickname}
          </div>
        )} */}

        {/* Hidden audio elements */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            loop
            autoPlay
            controls
            className="hidden"
          />
        )}

        {videoAudioUrl && (
          <audio
            ref={videoAudioRef}
            src={videoAudioUrl}
            loop
            autoPlay
            controls
          />
        )}

        {/* LOADING OVERLAY */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6">
            <div className="text-white text-2xl font-extralight tracking-[0.3em] uppercase animate-pulse">
              Creating your link...
            </div>
            <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden border border-white/20">
              <div
                className="h-full bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 transition-all duration-300 ease-out rounded-full shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="text-white/60 text-base font-light tracking-wider">{loadingProgress}%</div>
          </div>
        )}
    
        {/* NICKNAME STEP */}
        {step === "nickname" && (
          <div
            className={`transition-all duration-1000 flex flex-col items-center ${
              showContent ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-6"
            }`}
          >
            <h2 className="text-white text-2xl sm:text-3xl font-extralight tracking-[0.2em] uppercase mb-3 text-center">
              enter nickname
            </h2>

            <div className="flex flex-col items-center gap-6 w-full px-6">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={handleNicknameKeyPress}
                placeholder="Your name..."
                className="bg-white/10 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full text-center backdrop-blur-md border border-white/30 focus:border-white/70 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-500 text-lg sm:text-xl tracking-wider shadow-[0_8px_32px_rgba(0,0,0,0.3)] placeholder:text-white/30 w-full max-w-[340px]"
                autoFocus
              />

              {/* animowany przycisk, który pojawia się pod inputem, nie zmieniając layoutu */}
              <div
                className={`transition-all duration-700 ease-out ${
                  hasNickname
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                <button
                  onClick={handleNicknameConfirm}
                  className="group relative bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-12 sm:px-16 py-4 sm:py-5 text-base sm:text-lg rounded-full mt-4 font-light tracking-[0.2em] uppercase shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_70px_rgba(16,185,129,0.6)] hover:scale-105 transition-all duration-500"
                >
                  <span className="relative z-10">Next →</span>
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-emerald-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BACKGROUND STEP */}
        {step === "background" && (
          <div
            className={`flex flex-col items-center gap-5 sm:gap-6 z-20 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className={`text-2xl sm:text-3xl font-extralight tracking-[0.2em] uppercase mb-2 sm:mb-3 text-center transition-all duration-1000 ${
              isLightBackground ? "text-primary" : "text-secondary"
            }`}>
              background?
            </h1>

            {/* Color / Image Switch */}
            <div className="flex gap-2 p-1.5 bg-white/5 rounded-full backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <button
                type="button"
                onClick={() => setBackgroundType("color")}
                className={`px-6 sm:px-10 py-2 sm:py-3 rounded-full font-light tracking-[0.15em] uppercase text-[10px] sm:text-xs transition-all duration-1000 ${
              isLightBackground ? "text-primary" : "text-secondary"
            }`}>
                Color
              </button>
              <button
                type="button"
                onClick={() => {setBackgroundType("image");  setBackgroundColor("#000000")}}
                className={`px-6 sm:px-10 py-2 sm:py-3 rounded-full font-light tracking-[0.15em] uppercase text-[10px] sm:text-xs transition-all duration-1000 ${
                  isLightBackground ? "text-primary" : "text-secondary"
            }`}>
                Image
              </button>
            </div>

            {/* Background Options */}
            <div className="flex flex-col items-center gap-5 mt-3 w-full px-4 transition-all duration-500">
              {backgroundType === "color" ? (
                <>
                  <div
                    onClick={() => colorInputRef.current?.click()}
                    className="w-36 sm:w-48 h-36 sm:h-48 rounded-2xl shadow-[0_0_40px_rgba(128,128,128,0.5)] transition-all duration-500 cursor-pointer hover:scale-105"
                    style={{ backgroundColor: backgroundColor || "#000000" }}
                  />
                  <input
                    type="text"
                    value={backgroundColor || "#000000"}
                    onChange={(e) => handleHexChange(e.target.value)}
                    onKeyPress={handleHexKeyPress}
                    className={`bg-white/10 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-center backdrop-blur-md border border-white/30 focus:border-white/70 focus:outline-none focus:ring-4 focus:ring-white/20 transition-colors duration-500 font-mono text-sm sm:text-base tracking-wider shadow-[0_8px_32px_rgba(0,0,0,0.3)] w-40 sm:w-48 ${
                      isLightBackground ? "text-primary" : "text-secondary"
                    }`}
                    placeholder="#000000"
                  />
                  <input
                    ref={colorInputRef}
                    type="color"
                    value={backgroundColor || "#000000"}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="opacity-0 w-0 h-0 absolute"
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
                    <div className="px-8 sm:px-12 py-4 sm:py-5 rounded-full text-white text-sm sm:text-base border-2 border-white/30 hover:border-white/70 bg-linear-to-br from-white/10 to-white/0 hover:from-white/15 hover:to-white/5 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] backdrop-blur-md font-light tracking-[0.15em] uppercase text-center">
                      Upload Image
                    </div>
                  </label>

                  {backgroundImage && (
                  <div
                      className={`flex flex-col items-center gap-3 p-5 sm:p-8 rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.4)] w-[90%] max-w-[320px] sm:max-w-none
                        ${isLightBackground ? 'bg-white/30 border-black/10' : 'bg-black/80 border-white/10'}
                      `}
                    >        
                    <label className="text-white text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase">
                        Opacity: {imageOpacity}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={imageOpacity}
                        onChange={(e) => setImageOpacity(Number(e.target.value))}
                        className="w-full sm:w-60 accent-white"
                      />
                      <label className="text-white text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase mt-3">
                        Scale: {imageScale}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        value={imageScale}
                        onChange={(e) => setImageScale(Number(e.target.value))}
                        className="w-full sm:w-60 accent-white"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* NEXT BUTTON */}
            <div
                className={`transition-all duration-700 ease-out mt-4 sm:mt-6 ${
                  hasBackgroundSelection
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
              <button
                type="button"
                onClick={handleBackgroundConfirm}
                className="group relative bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-10 sm:px-16 py-4 sm:py-5 text-sm sm:text-lg rounded-full font-light tracking-[0.2em] uppercase shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:shadow-[0_0_70px_rgba(16,185,129,0.7)] hover:scale-105 transition-all duration-500"
              >
                <span className="relative z-10">Next →</span>
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-emerald-400" />
              </button>
            </div>
          </div>
        )}

        {/* MEDIA STEP */}
        {step === "media" && (
          <div
            className={`flex flex-col items-center gap-6 z-20 transition-all duration-1000 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            onKeyPress={handleMediaKeyPress}
            tabIndex={0}
          >
            <h2
              className={`text-3xl font-extralight drop-shadow-lg tracking-[0.2em] uppercase mb-3 ${
                isLightBackground ? "text-primary" : "text-secondary"
              }`}
            >
              add media?
            </h2>

            <div className="flex gap-2 p-1.5 bg-white/5 rounded-full backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <button
                type="button"
                onClick={() => setMediaType("gif")}
                className={`px-10 py-3 rounded-full transition-all duration-500 font-light tracking-[0.15em] uppercase text-xs ${
                  mediaType === "gif"
                    ? "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.3)]"
                    : `${
                        isLightBackground
                          ? "text-black/60 hover:text-black/80 hover:bg-white/10"
                          : "text-white/60 hover:text-white/90 hover:bg-white/10"
                      }`
                }`}
              >
                GIF
              </button>
              <button
                type="button"
                onClick={() => setMediaType("video")}
                className={`px-10 py-3 rounded-full transition-all duration-500 font-light tracking-[0.15em] uppercase text-xs ${
                  mediaType === "video"
                    ? "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.3)]"
                    : `${
                        isLightBackground
                          ? "text-black/60 hover:text-black/80 hover:bg-white/10" 
                          : "text-white/60 hover:text-white/90 hover:bg-white/10" 
                      }`
                }`}
              >
                Video
              </button>
            </div>

            <div className="flex flex-col items-center gap-5 mt-3">
              <input
                type="file"
                accept={mediaType === "video" ? "video/*" : "image/gif"}
                onChange={handleMediaUpload}
                className="hidden"
                id="media-upload"
                key={mediaUrl || "media-input"}
              />
              <label htmlFor="media-upload" className="cursor-pointer">
               <div
                  className={`px-12 py-5 rounded-full transition-all duration-500 font-light tracking-[0.15em] uppercase text-base backdrop-blur-md border ${
                    isLightBackground
                      ? "bg-white/5 border-black/20 text-black/80 hover:bg-black/20 hover:text-black"
                      : "bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                  } hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]`}
                >
                  {mediaUrl ? "Change file" : `Upload ${mediaType === "gif" ? "GIF" : "Video"}`}
                </div>
              </label>
              {mediaUrl && (
                <>
                {mediaType === "gif" && (
                  <img
                    src={mediaUrl}
                    alt="GIF Preview"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      height: `${mediaScale}vh`,
                      width: "auto",
                      maxWidth: "100vw",         
                      objectFit: "contain",  
                      pointerEvents: "none",
                      zIndex: -2,
                      opacity: 0.8,
                    }}
                  />
                )}

                {mediaType === "video" && (
                  <video
                    ref={videoRef}
                    src={mediaUrl}
                    autoPlay
                    loop
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      height: `${videoScale}vh`,
                      width: "auto",
                      maxWidth: "100vw",         
                      objectFit: "contain",  
                      pointerEvents: "none",
                      zIndex: 0,
                      opacity: 0.15,
                    }}
                  />
                )}
                </>
              )}
              <span className={`${isLightBackground ? "text-primary" : "text-secondary" } text-xs block`}>
                Max file size: 50MB
              </span>
              {mediaUrl && (
                <>
                  <p className={`text-xs font-light tracking-wider animate-in fade-in duration-500 ${isLightBackground ? "text-primary" : "text-secondary"} text-xs block`}>
                    ✓ File uploaded successfully
                  </p>
                  <div className="flex flex-col items-center gap-3 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/30 shadow-[0_8px_48px_rgba(0,0,0,0.4)]">
                    <label className={`${isLightBackground ? "text-primary" : "text-secondary"} text-xs font-light tracking-[0.2em] uppercase`}>
                      {mediaType === "video" ? "Video" : "Image"} Scale: {mediaType === "video" ? videoScale : mediaScale}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={mediaType === "video" ? videoScale : mediaScale}
                      onChange={(e) =>
                        mediaType === "video"
                          ? setVideoScale(Number(e.target.value))
                          : setMediaScale(Number(e.target.value))
                      }
                      className="w-60 accent-white"
                    />
                    {mediaType === "video" && mediaUrl && (
                      <div
                        className={`flex flex-col items-center gap-3 mt-4 p-6 rounded-2xl w-72 backdrop-blur-md transition-all duration-500 ${
                          isLightBackground
                            ? "bg-black/10 border border-black/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                            : "bg-white/10 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                        }`}
                      >
                        <label className={`${isLightBackground ? "text-primary" : "text-secondary"} text-xs font-light tracking-[0.2em] uppercase block mb-1`}>
                          Original Video Volume: {videoVolume}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={videoVolume}
                          onChange={(e) => setVideoVolume(Number(e.target.value))}
                          className="w-full accent-white"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {hasMediaSelection && (
              <button
                type="button"
                onClick={handleMediaConfirm}
                className="group relative bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-16 py-5 text-lg rounded-full mt-6 animate-in fade-in slide-in-from-bottom-4 font-light tracking-[0.2em] uppercase shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.7)] hover:scale-110 transition-all duration-500"
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
            className={`relative flex flex-col items-center gap-6 z-20 transition-all duration-1000 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            onKeyUp={handleAudioKeyPress}
            tabIndex={0}
          >
            {/* MEDIA PREVIEW */}
            {mediaUrl && (
              <>
                {mediaType === "gif" && (
                  <img
                    src={mediaUrl}
                    alt="GIF Preview"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      height: `${mediaScale}vh`,   
                      width: "auto",
                      maxWidth: "100vw",           
                      objectFit: "contain",        
                      pointerEvents: "none",
                      zIndex: 0,
                      opacity: 0.15,
                    }}
                  />
                )}

                {mediaType === "video" && (
                  <video
                  ref={(el) => {
                    if (el) {
                      el.volume = videoVolume / 100
                      el.muted = muteOriginalAudio
                      videoRef.current = el
                    }
                  }}
                    src={mediaUrl}
                    autoPlay
                    loop
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      height: `${videoScale}vh`,
                      width: "auto",
                      maxWidth: "100vw",        
                      objectFit: "contain",     
                      pointerEvents: "none",
                      zIndex: 0,
                      opacity: 0.15,
                    }}
                  />
                )}
              </>
            )}

            <h2 className={`text-3xl font-extralight drop-shadow-lg tracking-[0.2em] uppercase mb-3 ${
              isLightBackground ? "text-primary" : "text-secondary"
            }`}>
              add audio?
            </h2>

            <div className="flex flex-col items-center gap-5 mt-3">
              <input
                type="file"
                accept=".mp3, .wav, .m4a, .ogg, .mp4"
                onChange={handleAudioUpload}
                className="hidden"
                id="audio-upload"
                key={audioUrl || "audio-input"}
              />
              <label htmlFor="audio-upload" className="cursor-pointer">
              <div
                className={`px-12 py-5 rounded-full text-base border-2 border-white/30 bg-linear-to-br from-white/10 to-white/0 hover:from-white/15 hover:to-white/5 backdrop-blur-md font-light tracking-[0.15em] uppercase transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]
                  ${isLightBackground ? "text-primary hover:text-primary hover:border-primary/70" : "text-secondary hover:text-secondary hover:border-white/70"}
                `}
              >
                {audioUrl ? "Change Audio" : "Upload Audio"}
              </div>

              </label>

              {audioUrl && (
                  <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-80">
                    <p className="text-white/70 text-xs font-light tracking-wider">✓ Audio uploaded</p>

                    <div className="w-full">
                      <label className="text-white text-xs font-light tracking-[0.2em] uppercase block mb-2">
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

                    <button
                      type="button"
                      onClick={() => setAudioUrl("")}
                      className="mt-2 px-4 py-2 text-xs text-white bg-red-500 rounded-full hover:bg-red-600 transition-all"
                    >
                      Remove Audio
                    </button>
                  </div>
                )}

              {mediaType === "video" && (
                <>
                  <div className={`text-xs font-light tracking-[0.2em] uppercase mt-6 ${
                    isLightBackground ? "text-primary" : "text-secondary"
                  }`}>
                    Video audio options
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 hover:border-white/50 transition-all duration-300">
                    <input
                      type="checkbox"
                      checked={muteOriginalAudio}
                      onChange={(e) => setMuteOriginalAudio(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500"
                    />
                    <span className={`text-xs font-light tracking-[0.15em] uppercase ${
                      isLightBackground ? "text-primary" : "text-secondary"
                    }`}>
                      Mute original video audio
                    </span>
                  </label>

                  {videoAudioUrl && (
                    <div className="flex flex-col items-center gap-3 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-72">
                      <p className="text-white/70 text-xs font-light tracking-wider">✓ Background audio uploaded</p>
                      <div className="w-full">
                        <label className="text-white text-xs font-light tracking-[0.2em] uppercase block mb-2">
                          Background Volume: {videoAudioVolume}%
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
              className="group relative bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-16 py-5 text-lg rounded-full mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-light tracking-[0.2em] uppercase shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.7)] hover:scale-110 transition-all"
            >
              <span className="relative z-10">{audioUrl || videoAudioUrl ? "Next →" : "Skip →"}</span>
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-emerald-400" />
            </button>
          </div>
        )}

        {/* SETTINGS STEP */}
        {step === "settings" && (
          <div
            className={`flex flex-col items-center gap-6 z-20 transition-all duration-1000 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            onKeyPress={handleSettingsKeyPress}
            tabIndex={0}
          >
            <h2 className={`text-3xl font-extralight drop-shadow-lg tracking-[0.2em] uppercase mb-3 ${
              isLightBackground ? "text-primary" : "text-secondary"
            }`}>
              link settings
            </h2>

            <div className="flex flex-col items-center gap-5 bg-white/10 backdrop-blur-md p-10 rounded-2xl border border-white/30 shadow-[0_8px_48px_rgba(0,0,0,0.4)]">
              <label className={`${isLightBackground ? "text-primary":"text-secondary" } text-base font-light tracking-[0.2em] uppercase`}>
                Link expires in:
              </label>


              <div className="flex gap-2">
                {[1, 8, 24].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setExpiryHours(hours)}
                    className={`px-8 py-4 rounded-xl transition-all duration-500 font-light tracking-[0.15em] uppercase text-sm ${
                      expiryHours === hours
                        ? `${
                            isLightBackground
                              ? "bg-primary text-white shadow-[0_8px_24px_rgba(0,0,0,0.3)] scale-110"
                              : "bg-secondary text-black shadow-[0_8px_24px_rgba(255,255,255,0.3)] scale-110"
                          }`
                        : `${
                            isLightBackground
                              ? "text-primary/90 hover:text-primary hover:bg-black/10 border border-secondary/40"
                              : "text-secondary/90 hover:text-secondary hover:bg-white/10 border border-white/20"
                          }`
                    }`}
                  >
                    {hours}h
                  </button>
                ))}
              </div>

              
              <p className={`${isLightBackground ? "text-primary" : "text-secondary"} text-xs font-light tracking-wider mt-3 text-center max-w-sm`}>
                {expiryHours === 0
                  ? "Link will be accessible forever"
                  : `Link will be automatically deleted after ${expiryHours} hour${expiryHours > 1 ? "s" : ""}`}
              </p>
            </div>

            {mediaType === "video" && (
              <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/30 shadow-[0_8px_48px_rgba(0,0,0,0.4)]">
                <label className={`${isLightBackground ? "text-primary" : "text-secondary"} text-base font-light tracking-[0.2em] uppercase`}>
                  Video playback:
                </label>
                <label className="flex items-center gap-3 cursor-pointer bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 hover:border-white/50 transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={showVideoControls}  
                    onChange={(e) => setShowVideoControls(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <span className={`${isLightBackground ? "text-primary" : "text-secondary"} text-xs font-light tracking-[0.15em] uppercase`}>
                    Allow viewers to control video
                  </span>
                </label>
                <p className={`text-xs font-light tracking-wider text-center max-w-sm ${
                  isLightBackground ? "text-primary/70" : "text-secondary/70"
                }`}>
                  {showVideoControls
                    ? "Viewers can pause, play, and scrub through the video"
                    : "Video will loop automatically without controls"}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleFinalConfirm}
              disabled={isCreating}
              className="group relative bg-linear-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:via-green-400 hover:to-emerald-400 text-white px-16 py-5 text-lg rounded-full mt-6 animate-in fade-in slide-in-from-bottom-4 font-light tracking-[0.2em] uppercase shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.7)] hover:scale-110 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              <span className="relative z-10">Create Link →</span>
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-emerald-400" />
            </button>
          </div>
        )}


    </div>
  )
}