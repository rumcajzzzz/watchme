"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import tinycolor from "tinycolor2"
import NicknameStep from "@/components/steps/nickname"
import BackgroundStep from "@/components/steps/background"
import MediaStep from "@/components/steps/media"
import AudioStep from "@/components/steps/audio"
import SettingsStep from "@/components/steps/settings"

import { useMediaSync } from "@/hooks/useMediaSync";
import { AnimatePresence, motion } from "framer-motion"
import { useUploadLoader } from "@/hooks/useUploadLoader";
import UploadOverlay from "@/components/uploadOverlay"

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
  const [isCreating, setIsCreating] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [videoVolume, setVideoVolume] = useState<number>(100)
  const [mediaScale, setMediaScale] = useState<number>(100)
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if ('ontouchstart' in window) return
      const x = (e.clientX / window.innerWidth - 0.5) * 3;
      const y = (e.clientY / window.innerHeight - 0.5) * 3;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  const { uploading, progress, startUploading, finishUploading } = useUploadLoader();
  const { videoRef, audioRef, videoAudioRef } = useMediaSync({
    step,
    audioVolume,
    videoVolume,
    videoAudioVolume,
    muteOriginalAudio,
  });
  
  
  const handleMediaKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && hasMediaSelection) {
      handleMediaConfirm()
    }
  }
  const handleAudioKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAudioConfirm()
    }
  }
  const handleHexChange = (value: string) => {
    let normalizedValue = value.trim()
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


  const handleMediaConfirm = () => {
    setVideoAudioVolume(videoVolume);
    handleNextStep("audio")
  };
  const handleAudioConfirm = () => {
    handleNextStep("settings")
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
        console.error("Error saving to Supabase:", error)
        throw error
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push(`/${id}`)
    } catch (error) {
      console.error("Failed to create screen:", error)
      alert("Failed to create screen. Please try again.")
      setIsCreating(false)
      setLoadingProgress(0)
    }
  }


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      startUploading();
      const url = await uploadToSupabase(file, "backgrounds");
      finishUploading();
      setBackgroundImage(url);
    } catch (error) {
      finishUploading();
      alert("Failed to upload image.");
    }
  };
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    
    const MAX_FILE_SIZE = 45 * 1024 * 1024 
    const file = e.target.files?.[0]
    if (!file) return
    startUploading();
    if (file.size > MAX_FILE_SIZE) {
      alert("File is too big! Maximum allowed size is 50MB.")
      finishUploading();
      return
    }  
    try {
      const url = await uploadToSupabase(file, "media")
      setMediaUrl(url)
      finishUploading();
    } catch (error) {
      console.error("Upload failed:", error)
      finishUploading();
      alert("Failed to upload media.")
    }
  }
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    
    const file = e.target.files?.[0]
    if (!file) return
    startUploading();
    try {
      const url = await uploadToSupabase(file, "audio")
      setAudioUrl(url)
      finishUploading();
    } catch (error) {
      finishUploading();
      console.error("Upload failed:", error)
      alert("Failed to upload audio.")
    }
  }


  const hasBackgroundSelection =
    (backgroundType === "color" && backgroundColor.trim() !== "") ||
    (backgroundType === "image" && backgroundImage.trim() !== "")

  const hasMediaSelection = (mediaUrl || "").trim() !== ""
  const isLightBackground = tinycolor(backgroundColor).isLight();

  const handleNextStep = (next: typeof step) => setStep(next);

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
        
      <motion.div
        className="flex items-center justify-center w-full h-full"
        style={{
          transform: `perspective(1000px) rotateX(${-mousePosition.y * 20}deg) rotateY(${mousePosition.x * 20}deg)`,
          transition: "transform 0.1s ease-out"
        }}
       >
        <AnimatePresence mode="wait">
          
          {/* NICKNAME STEP */}
          {step === "nickname" && (
            <NicknameStep
              key="nickname"
              nickname={nickname}
              setNickname={setNickname}
              hasNickname={nickname.trim() !== ""}
              handleNicknameKeyPress={(e) => {
                if (e.key === "Enter" && nickname.trim() !== "") {
                  handleNextStep("background");
                }
              }}
              handleNicknameConfirm={() => handleNextStep("background")}
            />
          )}  

          {/* BACKGROUND STEP */}
          {step === "background" && (
            <BackgroundStep
              key="background"
              backgroundType={backgroundType}
              setBackgroundType={setBackgroundType}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              setBackgroundImage={setBackgroundImage}
              backgroundImage={backgroundImage}
              handleImageUpload={handleImageUpload}
              colorInputRef={colorInputRef}
              handleHexChange={handleHexChange}
              imageOpacity={imageOpacity}
              setImageOpacity={setImageOpacity}
              imageScale={imageScale}
              setImageScale={setImageScale}
              hasBackgroundSelection={hasBackgroundSelection}
              handleBackgroundConfirm={() => handleNextStep("media")}
              isLightBackground={isLightBackground}
            />
          )}

          {/* MEDIA STEP */}
          {step === "media" && (
            <MediaStep
              key="media"
              mediaType={mediaType}
              setMediaType={setMediaType}
              setMediaUrl={setMediaUrl}
              mediaUrl={mediaUrl}
              handleMediaUpload={handleMediaUpload}
              mediaScale={mediaScale}
              setMediaScale={setMediaScale}
              videoScale={videoScale}
              setVideoScale={setVideoScale}
              videoVolume={videoVolume}
              setVideoVolume={setVideoVolume}
              handleMediaKeyPress={handleMediaKeyPress}
              handleMediaConfirm={handleMediaConfirm}
              hasMediaSelection={hasMediaSelection}
              isLightBackground={isLightBackground}
            />
          )}

          {/* AUDIO STEP */}
          {step === "audio" && (
            <AudioStep
              key="audio"
              mediaType={mediaType}
              mediaUrl={mediaUrl}
              mediaScale={mediaScale}
              audioVolume={audioVolume}
              videoScale={videoScale}
              videoVolume={videoVolume}
              muteOriginalAudio={muteOriginalAudio}
              videoAudioUrl={videoAudioUrl}
              videoAudioVolume={videoAudioVolume}
              audioUrl={audioUrl}
              isLightBackground={isLightBackground}
              setAudioUrl={setAudioUrl}
              setAudioVolume={setAudioVolume}
              setMuteOriginalAudio={setMuteOriginalAudio}
              setVideoAudioVolume={setVideoAudioVolume}
              handleAudioUpload={handleAudioUpload}
              handleAudioKeyPress={handleAudioKeyPress}
              handleAudioConfirm={handleAudioConfirm}
              videoRef={videoRef}
            />
          )}

          {/* SETTINGS STEP */}
          {step === "settings" && (
            <SettingsStep
              key="settings"
              isLightBackground={isLightBackground}
              mediaType={mediaType}
              expiryHours={expiryHours}
              setExpiryHours={setExpiryHours}
              showVideoControls={showVideoControls}
              setShowVideoControls={setShowVideoControls}
              handleFinalConfirm={handleFinalConfirm}
              isCreating={isCreating}
            />
          )}
        </AnimatePresence>
      </motion.div>
      {uploading && <UploadOverlay progress={progress} />}
    </div>
  )
}