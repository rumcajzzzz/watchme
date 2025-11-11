import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import ViewScreenClient from "./view-screen-client"

type ScreenData = {
  id: string
  background_type: "color" | "image"
  background_color: string | null
  background_image: string | null
  image_opacity: number
  image_scale: number
  media_url: string
  media_type: "gif" | "video"
  video_scale: number
  media_scale: number
  audio_url: string | null
  audio_volume: number
  video_audio_url: string | null
  video_audio_volume: number
  expires_at: string | null
}

export default async function ViewScreen({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch screen data from Supabase
  const { data: screen, error } = await supabase.from("screens").select("*").eq("id", id).single<ScreenData>()

  if (error || !screen) {
    notFound()
  }

  if (screen.expires_at && new Date(screen.expires_at) < new Date()) {
    notFound()
  }

  return <ViewScreenClient screen={screen} />
}
