"use client"

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

  useEffect(() => {
    setIsLoaded(true)

    if (audioRef.current && screen.audio_url) {
      audioRef.current.volume = screen.audio_volume / 100
      audioRef.current.play().catch((error) => {
        console.log("[v0] Audio autoplay prevented:", error)
      })
    }

    if (videoAudioRef.current && screen.video_audio_url) {
      videoAudioRef.current.volume = screen.video_audio_volume / 100
      videoAudioRef.current.play().catch((error) => {
        console.log("[v0] Video audio autoplay prevented:", error)
      })
    }
  }, [screen])

  const getBackgroundStyle = () => {
    if (screen.background_type === "color") {
      return { backgroundColor: screen.background_color || "#000000" }
    } else if (screen.background_image) {
      return {
        backgroundImage: `url(${screen.background_image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    }
    return { backgroundColor: "#000000" }
  }

  return (
    <div
      className={`fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center transition-opacity duration-1000 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
      style={getBackgroundStyle()}
    >
      {/* Image opacity overlay */}
      {screen.background_type === "image" && screen.background_image && (
        <div className="absolute inset-0 bg-black" style={{ opacity: (100 - screen.image_opacity) / 100 }} />
      )}

      {/* Media display */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {screen.media_type === "video" ? (
          <video
            ref={videoRef}
            src={screen.media_url}
            autoPlay
            loop
            controls={screen.show_video_controls}
            muted={screen.mute_original_audio}
            className="object-contain"
            style={{
              maxWidth: `${screen.video_scale}%`,
              maxHeight: `${screen.video_scale}%`,
            }}
          />
        ) : (
          <img
            src={screen.media_url || "/placeholder.svg"}
            alt="Media"
            className="object-contain"
            style={{
              maxWidth: `${screen.image_scale}%`,
              maxHeight: `${screen.image_scale}%`,
            }}
          />
        )}
      </div>

      {screen.nickname && (
        <div className="absolute top-6 left-6 z-20 text-white text-lg font-light tracking-[0.2em] uppercase opacity-50 pointer-events-none">
          {screen.nickname}
        </div>
      )}

      {screen.audio_url && <audio ref={audioRef} src={screen.audio_url} loop />}
      {screen.video_audio_url && <audio ref={videoAudioRef} src={screen.video_audio_url} loop />}
    </div>
  )
}
