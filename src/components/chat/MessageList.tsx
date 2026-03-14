import { useEffect, useMemo, useRef, useState } from "react"
import MessageBubble from "@/components/chat/MessageBubble"
import { useChatStore } from "@/store/chatStore"

interface MessageListProps {
  searchQuery?: string
}

export default function MessageList({ searchQuery = "" }: MessageListProps) {
  const { conversations, activeConversationId, currentUserId } = useChatStore()
  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  )
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const matchedMessageIds = useMemo(() => {
    if (!normalizedQuery || !activeConversation) {
      return []
    }

    return activeConversation.messages
      .filter((message) =>
        message.text ? message.text.toLowerCase().includes(normalizedQuery) : false,
      )
      .map((message) => message.id)
  }, [activeConversation, normalizedQuery])

  useEffect(() => {
    if (!matchedMessageIds.length) {
      return
    }

    const firstMatch = messageRefs.current[matchedMessageIds[0]]
    if (firstMatch) {
      firstMatch.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [matchedMessageIds])

  useEffect(() => {
    if (!bottomRef.current) {
      return
    }

    bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [activeConversation?.messages.length])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {activeConversation?.messages.map((message) => {
        const isMatch = matchedMessageIds.includes(message.id)

        return (
          <div
            key={message.id}
            ref={(node) => {
              messageRefs.current[message.id] = node
            }}
          >
            <MessageBubble
              message={message}
              isSent={message.senderId === currentUserId}
              highlightQuery={normalizedQuery}
              isHighlighted={isMatch}
            />
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
