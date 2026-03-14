import { useRef, useState, type ChangeEvent, type FormEvent } from "react"
import EmojiPicker from "emoji-picker-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChatStore } from "@/store/chatStore"

export default function MessageInput() {
  const [value, setValue] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isEmojiOpen, setIsEmojiOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const sendMessage = useChatStore((state) => state.sendMessage)
  const replyTarget = useChatStore((state) => state.replyTarget)
  const setReplyTarget = useChatStore((state) => state.setReplyTarget)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed && !imagePreview) {
      return
    }

    sendMessage({
      text: trimmed || undefined,
      imageUrl: imagePreview ?? undefined,
      type: imagePreview ? "image" : "text",
    })
    setValue("")
    setImagePreview(null)
    setIsEmojiOpen(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-border p-4">
      {replyTarget ? (
        <div className="mb-3 flex items-center justify-between rounded-2xl border border-border bg-background px-3 py-2 text-xs">
          <div className="min-w-0">
            <p className="font-semibold">Replying to</p>
            <p className="truncate text-muted-foreground">
              {replyTarget.deletedAt
                ? "Message deleted"
                : replyTarget.text || (replyTarget.imageUrl ? "Photo" : "")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplyTarget(null)}
            className="rounded-full border border-border px-2 py-1 text-[11px] font-semibold"
          >
            Cancel
          </button>
        </div>
      ) : null}
      {imagePreview ? (
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
          <img
            src={imagePreview}
            alt="Upload preview"
            className="h-16 w-16 rounded-xl object-cover"
          />
          <div className="flex-1 text-xs text-muted-foreground">Ready to send image</div>
          <button
            type="button"
            onClick={() => {
              setImagePreview(null)
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
            }}
            className="rounded-full border border-border px-3 py-1 text-xs font-medium"
          >
            Remove
          </button>
        </div>
      ) : null}
      <div className="relative flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full border border-border px-2.5 py-2 text-xs font-medium"
          aria-label="Add image"
          title="Add image"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 7h4l2-2h4l2 2h4v12H4z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => setIsEmojiOpen((prev) => !prev)}
          className="rounded-full border border-border px-2.5 py-2 text-xs font-medium"
          aria-label="Open emoji picker"
          title="Emoji"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M8.5 14.5c.9 1 2.2 1.5 3.5 1.5s2.6-.5 3.5-1.5" />
            <circle cx="9" cy="10" r="1" />
            <circle cx="15" cy="10" r="1" />
          </svg>
        </button>
        {isEmojiOpen ? (
          <div className="absolute bottom-14 left-0 z-20">
            <EmojiPicker
              onEmojiClick={(emoji) => {
                setValue((prev) => prev + emoji.emoji)
              }}
              width={320}
              height={360}
            />
          </div>
        ) : null}
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Type a message"
          className="h-9 border-0 bg-transparent px-0 focus:ring-0"
        />
        <Button type="submit" className="rounded-full">
          Send
        </Button>
      </div>
    </form>
  )
}
