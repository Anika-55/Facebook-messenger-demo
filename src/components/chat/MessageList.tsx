import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import MessageBubble from "@/components/chat/MessageBubble"
import { useChatStore } from "@/store/chatStore"

const currentUserId = "user-1"

export default function MessageList() {
  const { conversations, activeConversationId } = useChatStore()
  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  )
  const [isTyping, setIsTyping] = useState(false)

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

  return (
    <ScrollArea className="flex-1 px-6 py-6">
      <div className="flex min-h-full flex-col justify-end gap-4">
        {activeConversation?.messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isSent={message.senderId === currentUserId}
          />
        ))}
        {isTyping ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span>User is typing...</span>
          </div>
        ) : null}
      </div>
    </ScrollArea>
  )
}
