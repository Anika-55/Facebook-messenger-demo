import { useState } from "react"
import { useChatStore } from "@/store/chatStore"
import type { Message, Reaction } from "@/types/chat"

interface MessageBubbleProps {
  message: Message
  isSent: boolean
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

export default function MessageBubble({ message, isSent }: MessageBubbleProps) {
  const addReaction = useChatStore((state) => state.addReaction)
  const editMessage = useChatStore((state) => state.editMessage)
  const [showReactions, setShowReactions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(message.text)
  const reactionEntries = getReactionEntries(message)

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
            }`}
          >
            {message.text}
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
          {isSent ? (
            <button
              type="button"
              onClick={() => {
                setDraft(message.text)
                setIsEditing(true)
              }}
              className="rounded-full px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted"
            >
              ✎
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
        {isSent ? ` · ${getStatusLabel(message.status)}` : ""}
      </span>
    </div>
  )
}
