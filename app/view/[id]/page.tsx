import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

type ScreenData = {
  id: string
  background_type: "color" | "image"
  background_color: string | null
  background_image: string | null
  image_opacity: number
  media_url: string
  media_type: "gif" | "video"
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
      className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center"
      style={getBackgroundStyle()}
    >
      {/* Image opacity overlay */}
      {screen.background_type === "image" && screen.background_image && (
        <div className="absolute inset-0 bg-black" style={{ opacity: (100 - screen.image_opacity) / 100 }} />
      )}

      {/* Media display */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {screen.media_type === "video" ? (
          <video src={screen.media_url} autoPlay loop muted className="max-w-full max-h-full" />
        ) : (
          <img
            src={screen.media_url || "/placeholder.svg"}
            alt="Media"
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>
    </div>
  )
}
