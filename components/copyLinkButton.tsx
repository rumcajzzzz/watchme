import { useState } from "react"
import { Link as LinkIcon } from "lucide-react"

interface CopyLinkButtonProps {
  screenId: string
}

export default function CopyLinkButton({ screenId }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    const url = `${window.location.origin}/view/${screenId}`
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
      })
      .catch(() => {
        // optional: handle error
      })
  }
  return (
    <button
    type="button"
    onClick={handleClick} // ← use your handleClick here
    className={`px-4 py-2 my-3 w-32 rounded-full text-black backdrop-blur-sm transition-all duration-1000 ease-out flex items-center justify-center mx-auto
      ${copied ? "bg-green-400 hover:bg-green-500" : "bg-white/20 hover:bg-white/40"}`}
  >
    <LinkIcon className="w-5 h-5" />
  </button>
  )
}
