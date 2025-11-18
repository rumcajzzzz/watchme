"use client"

import CopyLinkButton from "@/components/copyLinkButton"
import { motion } from "framer-motion"
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
  media_scale: number
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

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if ('ontouchstart' in window) return
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = (e.clientY / window.innerHeight) * 2 - 1
    setMousePosition({ x, y })
  }
  
  const getBackgroundStyle = () => {
    if (screen.background_type === "color") {
      return { backgroundColor: screen.background_color || "#000000" }
    }
    return { backgroundColor: "#000000" }
  }
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
  // useEffect(() => {
  //   const checkOrientation = () => setIsLandscape(window.innerWidth > window.innerHeight)
  //   window.addEventListener("resize", checkOrientation)
  //   checkOrientation()
  //   return () => window.removeEventListener("resize", checkOrientation)
  // }, [])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") startInteraction()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [interactionDone])

  // if (!isLandscape) {
  //   return (
  //     <div className={`fixed inset-0 flex items-center justify-center bg-black text-white text-center p-4 transition-opacity duration-500 ${
  //         isLandscape ? "opacity-0 pointer-events-none" : "opacity-100"
  //       }`}>
  //       <p>Rotate your phone to landscape to continue.</p>
  //     </div>
  //   )
  // }
  if (!interactionDone || !showScreen) {
    return (
      <div
        onClick={startInteraction} 
        className={`fixed inset-0 flex items-center justify-center bg-black text-white text-xl font-light tracking-wide transition-opacity duration-700 cursor-pointer ${
          interactionDone ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="text-center transform transition-transform duration-700 ease-out flex flex-col justify-center align-middle">
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

      <div
        className={`fixed inset-0 w-screen h-screen overflow-hidden transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={getBackgroundStyle()}
        onMouseMove={handleMouseMove}
       >
        {screen.background_type === "image" && screen.background_image && (
          <img
            src={screen.background_image}
            className="absolute inset-0 object-cover"
            style={{
              width: "100%",
              height: "100%",
              transform: `scale(${screen.image_scale / 100})`,
              opacity: screen.image_opacity / 100,
            }}
          />
        )}

        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{
            transform: `perspective(1000px) rotateX(${-mousePosition.y * 10}deg) rotateY(${mousePosition.x * 10}deg)`,
            transition: "transform 0.1s ease-out"
          }}
         >
          {/* MEDIA */}
          {screen.media_type === "video" ? (
            <video
              ref={videoRef}
              src={screen.media_url}
              loop
              playsInline
              muted={screen.mute_original_audio}
              className="pointer-events-none"
              style={{
                height: `${screen.video_scale}vh`,
                width: "auto",
                maxWidth: "100vw",
              }}
            />
          ) : (
            <img
              src={screen.media_url}
              className="pointer-events-none"
              style={{
                height: `${screen.media_scale}vh`,
                width: "auto",
                maxWidth: "100vw",
              }}
            />
          )}

          {/* NICKNAME */}
          {screen.nickname && (
            <div
              className="nickname-glow"
            >
              {screen.nickname}
            </div>
          )}
        </motion.div>

        {/* AUDIO */}
        {screen.audio_url && <audio ref={audioRef} src={screen.audio_url} loop />}
        {screen.video_audio_url && <audio ref={videoAudioRef} src={screen.video_audio_url} loop />}

      </div>

      <style jsx>{`
                  @keyframes glitch-move {
              0% { transform: translate(-50%, -50%) skew(0deg, 0deg); }
              50% { transform: translate(-52%, -48%) skew(2deg, -1deg); }
              100% { transform: translate(-49%, -51%) skew(-2deg, 2deg); }
            }

            @keyframes glitch-flicker {
              0% { opacity: 0.10; filter: blur(2px); }
              40% { opacity: 0.25; filter: blur(3px); }
              60% { opacity: 0.18; filter: blur(1.5px); }
              100% { opacity: 0.30; filter: blur(4px); }
            }
                    @keyframes fade-zoom {
                      0% { opacity: 0; transform: scale(0.95); }
                      100% { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-zoom { animation: fade-zoom 0.8s forwards; }

                    .nickname-glow {
                position: absolute;
                top: 10%;
                width: 100%;
                text-align: center;
                font-size: 3rem;
                font-weight: bold;
                text-transform: uppercase;
                opacity: 0.8;
                pointer-events: none;
                z-index: 9999;
              
                /* Same letters */
                color: white;
                mix-blend-mode: screen;
                filter: brightness(200%);
              }

              .nickname-glow::before {
                content: "";
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                
                /* Glow w 2.5× szerzej i 1.5× wyżej */
                width: 20%;
                height: 150%;

                /* Mocna poświata */
                background: radial-gradient(
                  circle,
                  rgba(255,255,255,0.7) 0%,
                  rgba(255,255,255,0.35) 25%,
                  rgba(255,255,255,0.15) 50%,
                  rgba(255,255,255,0.0) 100%
                );

                filter: blur(40px);
                opacity: 0.9;
                z-index: -1;
              }

              .nickname-glow::after {
              content: "";
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              
              width: 15%;
              height: 220%;

              /* Dziki glitchowany noise */
              background-image: url('data:image/svg+xml;utf8,
                <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
                  <filter id="glitchNoise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="5" seed="3"/>
                    <feDisplacementMap in="SourceGraphic" scale="90" />
                  </filter>
                  <rect width="100%" height="100%" filter="url(%23glitchNoise)" />
                </svg>'
              );

              opacity: 0.22;
              mix-blend-mode: screen;
              pointer-events: none;

              animation: glitch-move 0.22s steps(2, end) infinite,
                        glitch-flicker 0.9s ease-in-out infinite alternate;
            }
      `}</style>

    </div>
  )


}
