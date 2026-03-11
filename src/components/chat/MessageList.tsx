import { useEffect, useMemo, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import MessageBubble from "@/components/chat/MessageBubble"
import { useChatStore } from "@/store/chatStore"

const currentUserId = "user-1"

interface MessageListProps {
  searchQuery?: string
}

export default function MessageList({ searchQuery = "" }: MessageListProps) {
  const { conversations, activeConversationId } = useChatStore()
  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  )
  const [isTyping, setIsTyping] = useState(false)
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
    let timeoutId: number | undefined
    const toggleTyping = () => {
      setIsTyping(true)
      timeoutId = window.setTimeout(() => setIsTyping(false), 1800)
    }

    const intervalId = window.setInterval(toggleTyping, 6000)
    toggleTyping()

    return () => {
      window.clearInterval(intervalId)
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [activeConversationId])

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
    <ScrollArea className="flex-1 px-6 py-6">
      <div className="flex min-h-full flex-col justify-end gap-4">
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
        {isTyping ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span>User is typing...</span>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
