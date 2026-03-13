import { useEffect, useState } from "react"
import ChatWindow from "@/components/chat/ChatWindow"
import ConversationList from "@/components/conversation/ConversationList"
import { useChatStore } from "@/store/chatStore"

export default function MessengerPage() {
  const { activeConversationId, conversations, receiveMessage } = useChatStore()
  const [showChatOnMobile, setShowChatOnMobile] = useState(Boolean(activeConversationId))

  useEffect(() => {
    const cannedMessages = [
      "Hey, are you free for a quick sync?",
      "Just sent the latest mockups.",
      "Can you check the release notes?",
      "I added a few comments in the doc.",
      "Let me know when you are online.",
    ]

    const intervalId = window.setInterval(() => {
      const inactiveConversations = conversations.filter(
        (conversation) => conversation.id !== activeConversationId,
      )
      if (!inactiveConversations.length) {
        return
      }

      const target = inactiveConversations[Math.floor(Math.random() * inactiveConversations.length)]
      const senderId = target.participants.find((id) => id !== "user-1") ?? target.participants[0]
      const text = cannedMessages[Math.floor(Math.random() * cannedMessages.length)]
      receiveMessage(target.id, text, senderId)
    }, 12000)

    return () => window.clearInterval(intervalId)
  }, [activeConversationId, conversations, receiveMessage])

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <div className="flex h-full overflow-hidden">
        <aside
          className={`h-full w-[320px] shrink-0 border-r border-border ${
            showChatOnMobile ? "hidden md:block" : "block"
          }`}
        >
          <ConversationList onSelect={() => setShowChatOnMobile(true)} />
        </aside>

        <main
          className={`flex h-full flex-1 flex-col overflow-hidden ${
            showChatOnMobile ? "flex" : "hidden md:flex"
          }`}
        >
          <ChatWindow onBack={() => setShowChatOnMobile(false)} />
        </main>
      </div>
    </div>
  )
}
