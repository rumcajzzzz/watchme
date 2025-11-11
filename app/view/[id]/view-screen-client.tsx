"use client"

import CopyLinkButton from "@/components/copyLinkButton"
import { useEffect, useRef, useState } from "react"

type ScreenData = {
  id: string
  nickname: string | null
  background_type: "color" | "image"
  background_color: string | null
  background_image: string | null
  image_opacity: number
  image_scale: number
  media_url: string
  media_type: "gif" | "video"
  video_scale: number
  show_video_controls: boolean
  audio_url: string | null
  audio_volume: number
  video_audio_url: string | null
  video_audio_volume: number
  mute_original_audio: boolean
  expires_at: string | null
}

export default function ViewScreenClient({ screen }: { screen: ScreenData }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoAudioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [interactionDone, setInteractionDone] = useState(false)
  const [showScreen, setShowScreen] = useState(false)
  const [isLandscape, setIsLandscape] = useState(true)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    const audioEl = audioRef.current
    if (audioEl) {
      audioEl.addEventListener("canplay", () => {
        audioEl.volume = screen.audio_volume / 100
      })
    }
  }, [screen.audio_volume])
  
  useEffect(() => {
    const videoAudioEl = videoAudioRef.current
    if (videoAudioEl) {
      videoAudioEl.addEventListener("canplay", () => {
        videoAudioEl.volume = screen.video_audio_volume / 100
      })
    }
  }, [screen.video_audio_volume])
  useEffect(() => {
    const checkOrientation = () => setIsLandscape(window.innerWidth > window.innerHeight)
    window.addEventListener("resize", checkOrientation)
    checkOrientation()
    return () => window.removeEventListener("resize", checkOrientation)
  }, [])

  const startInteraction = () => {
    if (!interactionDone) {
      setInteractionDone(true)
      setTimeout(() => setShowScreen(true), 100)

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.volume = screen.audio_volume / 100
          audioRef.current.play().catch(console.log)
        }
        if (videoAudioRef.current) {
          videoAudioRef.current.volume = screen.video_audio_volume / 100
          videoAudioRef.current.play().catch(console.log)
        }
        if (videoRef.current) {
          videoRef.current.play().catch(console.log)
        }
      }, 200)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") startInteraction()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [interactionDone])


  const getBackgroundStyle = () => {
    if (screen.background_type === "color") {
      return { backgroundColor: screen.background_color || "#000000" }
    }
    return { backgroundColor: "#000000" }
  }

  if (!isLandscape) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center bg-black text-white text-center p-4 transition-opacity duration-500 ${
          isLandscape ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}>
        <p>Rotate your phone to landscape to continue.</p>
      </div>
    )
  }

  if (!interactionDone || !showScreen) {
    return (
      <div
        onClick={startInteraction} 
        className={`fixed inset-0 flex items-center justify-center bg-black text-white text-xl font-light tracking-wide transition-opacity duration-700 cursor-pointer ${
          interactionDone ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="text-center transform transition-transform duration-700 ease-out flex flex-col justify-center align-middle">
          <p>w4tchme!</p>
          <p className="mt-4 text-s opacity-20">Press SPACE or TAP to start</p>
          <CopyLinkButton screenId={screen.id} />
        </div>
      </div>
    )
  }
  return (
    <div
      className={`fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center transition-opacity duration-1000 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
      style={getBackgroundStyle()}
    >
      {screen.background_type === "image" && screen.background_image && (
        <img
          src={screen.background_image}
          alt="Background"
          className="absolute inset-0 object-cover transition-transform duration-1000 ease-out"
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${screen.image_scale / 100})`,
            opacity: screen.image_opacity / 100,
          }}
        />
      )}

      <div className="absolute inset-0 flex items-center justify-center z-10">
        {screen.media_type === "video" ? (
          <video
            ref={videoRef}
            src={screen.media_url}
            loop
            playsInline
            controls={screen.show_video_controls}
            muted={!interactionDone ? screen.mute_original_audio : false}
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            className="transition-transform duration-1000 ease-out pointer-events-none opacity-100"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              height: `${screen.video_scale}vh`,
              width: "auto",
              maxWidth: "100vw",
              objectFit: "contain",
              pointerEvents: "none",
            }}
          />
        ) : (
          <img
            src={screen.media_url || "/placeholder.svg"}
            alt="Media"
            className="transition-transform duration-1000 ease-out pointer-events-none opacity-100"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              height: `${screen.image_scale}vh`,
              width: "auto",
              maxWidth: "100vw",
              objectFit: "contain",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      <div className="absolute top-6 w-full text-center text-white text-xs font-thin tracking-widest opacity-20 z-99999">
        w4tchme!
      </div>
      {screen.nickname && (
        <div className="absolute top-12 w-full text-center text-white text-xs font-light tracking-[0.2em] uppercase opacity-50 pointer-events-none z-9999">
          {screen.nickname}
        </div>
      )}

      {screen.audio_url && (
        <audio ref={audioRef} src={screen.audio_url} loop />
      )}
      {screen.video_audio_url && (
        <audio ref={videoAudioRef} src={screen.video_audio_url} loop />
      )}

      <style jsx>{`
        @keyframes fade-zoom {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-zoom { animation: fade-zoom 0.8s forwards; }
      `}</style>
    </div>
  )
}
