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
  const deleteMessage = useChatStore((state) => state.deleteMessage)
  const setReplyTarget = useChatStore((state) => state.setReplyTarget)
  const forwardMessage = useChatStore((state) => state.forwardMessage)
  const { conversations, activeConversationId, users, currentUserId } = useChatStore()
  const [showReactions, setShowReactions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(message.text)
  const [isImageOpen, setIsImageOpen] = useState(false)
  const [isForwardOpen, setIsForwardOpen] = useState(false)
  const reactionEntries = getReactionEntries(message)

  const isImage = message.type === "image" && Boolean(message.imageUrl)
  const canEdit = isSent && message.type === "text" && !message.deletedAt
  const canDelete = isSent && !message.deletedAt
  const isDeleted = Boolean(message.deletedAt)

  const getConversationTitle = (conversationId: string) => {
    const conversation = conversations.find((item) => item.id === conversationId)
    if (!conversation) {
      return `Conversation ${conversationId.slice(-4)}`
    }
    if (conversation.name) {
      return conversation.name
    }
    const others = conversation.participants
      .filter((id) => id !== currentUserId)
      .map((id) => users.find((user) => user.id === id))
      .filter((user): user is typeof users[number] => Boolean(user))
    if (!others.length) {
      return "Conversation"
    }
    if (others.length === 1) {
      return others[0].name
    }
    return others.map((user) => user.name.split(" ")[0]).join(", ")
  }

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
            {message.replyTo ? (
              <div className="mb-2 rounded-xl bg-white/20 px-3 py-2 text-xs">
                <p className="font-semibold">Replying to</p>
                <p className="truncate">
                  {message.replyTo.deletedAt
                    ? "Message deleted"
                    : message.replyTo.text || (message.replyTo.imageUrl ? "Photo" : "")}
                </p>
              </div>
            ) : null}
            {message.forwardedFrom ? (
              <div className="mb-2 rounded-xl bg-white/20 px-3 py-2 text-xs">
                <p className="font-semibold">Forwarded</p>
                <p className="truncate">
                  {message.forwardedFrom.deletedAt
                    ? "Message deleted"
                    : message.forwardedFrom.text || (message.forwardedFrom.imageUrl ? "Photo" : "")}
                </p>
              </div>
            ) : null}
            {isDeleted ? (
              <span className="italic text-white/80">Message deleted</span>
            ) : isImage ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsImageOpen(true)}
                  className="block w-full"
                >
                  <img
                    src={message.imageUrl}
                    alt="Message attachment"
                    className="max-h-64 w-full rounded-xl object-cover"
                  />
                </button>
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
          <button
            type="button"
            onClick={() => setReplyTarget(message)}
            className="rounded-full px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted"
          >
            Reply
          </button>
          <button
            type="button"
            onClick={() => setIsForwardOpen(true)}
            className="rounded-full px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted"
          >
            Forward
          </button>
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
          {canDelete ? (
            <button
              type="button"
              onClick={() => deleteMessage(message.id)}
              className="rounded-full px-1.5 py-0.5 text-[11px] font-semibold text-red-500 hover:bg-muted"
            >
              Delete
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
      {isImage && isImageOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="relative max-h-[90vh] w-full max-w-3xl">
            <button
              type="button"
              onClick={() => setIsImageOpen(false)}
              className="absolute -top-10 right-0 rounded-full border border-white/30 bg-black/40 px-3 py-1 text-xs font-semibold text-white"
            >
              Close
            </button>
            <img
              src={message.imageUrl}
              alt="Message attachment"
              className="max-h-[90vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      ) : null}
      {isForwardOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Forward to</h3>
              <button
                type="button"
                onClick={() => setIsForwardOpen(false)}
                className="rounded-full border border-border px-2 py-1 text-xs font-medium"
              >
                Close
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => {
                    forwardMessage(message.id, conversation.id)
                    setIsForwardOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-left ${
                    conversation.id === activeConversationId ? "bg-muted/60" : "hover:bg-muted/50"
                  }`}
                >
                  <span className="text-xs font-semibold">
                    {getConversationTitle(conversation.id)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {conversation.id === activeConversationId ? "Current" : "Send"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
