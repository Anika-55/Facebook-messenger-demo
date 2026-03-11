import { useState } from "react"
import { useChatStore } from "@/store/chatStore"
import type { Message, Reaction } from "@/types/chat"

interface MessageBubbleProps {
  message: Message
  isSent: boolean
  highlightQuery?: string
  isHighlighted?: boolean
}

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })

const reactions: Reaction[] = ["👍", "❤️", "😂", "😮", "😢"]

const getReactionEntries = (message: Message) =>
  Object.entries(message.reactions ?? {}).filter(([, count]) => (count ?? 0) > 0)

const getStatusLabel = (status: Message["status"]) => {
  switch (status) {
    case "sent":
      return "✓ Sent"
    case "delivered":
      return "✓✓ Delivered"
    case "seen":
      return "✓✓ Seen"
    default:
      return ""
  }
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const highlightText = (text: string, query: string) => {
  if (!query) {
    return text
  }

  const regex = new RegExp(`(${escapeRegExp(query)})`, "ig")
  const parts = text.split(regex)
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={`${part}-${index}`} className="rounded bg-yellow-200 px-0.5 text-black">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  )
}

export default function MessageBubble({
  message,
  isSent,
  highlightQuery = "",
  isHighlighted = false,
}: MessageBubbleProps) {
  const addReaction = useChatStore((state) => state.addReaction)
  const editMessage = useChatStore((state) => state.editMessage)
  const [showReactions, setShowReactions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(message.text)
  const reactionEntries = getReactionEntries(message)

  const isImage = message.type === "image" && Boolean(message.imageUrl)
  const canEdit = isSent && message.type === "text"

  const handleSave = () => {
    if (draft.trim() && draft.trim() !== message.text) {
      editMessage(message.id, draft)
    }
    setIsEditing(false)
  }

  return (
    <div className={`flex flex-col ${isSent ? "items-end" : "items-start"}`}>
      <div className="group relative">
        {isEditing ? (
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                handleSave()
              }
            }}
            onBlur={handleSave}
            className={`max-w-[75%] rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              isSent ? "text-right" : ""
            }`}
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowReactions((prev) => !prev)}
            className={`max-w-[75%] rounded-2xl px-4 py-2 text-left text-sm ${
              isSent ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            } ${isHighlighted ? "ring-2 ring-amber-300" : ""}`}
          >
            {isImage ? (
              <div className="space-y-2">
                <img
                  src={message.imageUrl}
                  alt="Message attachment"
                  className="max-h-64 w-full rounded-xl object-cover"
                />
                {message.text ? (
                  <div className="text-sm">{highlightText(message.text, highlightQuery)}</div>
                ) : null}
              </div>
            ) : (
              highlightText(message.text, highlightQuery)
            )}
          </button>
        )}
        <div
          className={`absolute -top-9 flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-xs shadow-sm transition ${
            isSent ? "right-0" : "left-0"
          } ${showReactions ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          {reactions.map((reaction) => (
            <button
              key={reaction}
              type="button"
              onClick={() => addReaction(message.id, reaction)}
              className="rounded-full px-1.5 py-0.5 hover:bg-muted"
            >
              {reaction}
            </button>
          ))}
          {canEdit ? (
            <button
              type="button"
              onClick={() => {
                setDraft(message.text)
                setIsEditing(true)
              }}
              className="rounded-full px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted"
              aria-label="Edit message"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
      {reactionEntries.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {reactionEntries.map(([reaction, count]) => (
            <div
              key={reaction}
              className="flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              <span>{reaction}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      ) : null}
      <span className="mt-1 text-[11px] text-muted-foreground">
        {formatTime(message.timestamp)}
        {message.edited ? " (edited)" : ""}
        {isSent ? ` - ${getStatusLabel(message.status)}` : ""}
      </span>
    </div>
  )
}
