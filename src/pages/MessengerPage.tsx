import { useState } from "react"
import ChatWindow from "@/components/chat/ChatWindow"
import ConversationList from "@/components/conversation/ConversationList"
import { useChatStore } from "@/store/chatStore"

export default function MessengerPage() {
  const activeConversationId = useChatStore((state) => state.activeConversationId)
  const [showChatOnMobile, setShowChatOnMobile] = useState(Boolean(activeConversationId))

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8 md:flex-row">
        <aside
          className={`w-full shrink-0 overflow-hidden rounded-3xl border border-border bg-card md:w-64 lg:w-80 ${
            showChatOnMobile ? "hidden md:block" : "block"
          }`}
        >
          <ConversationList onSelect={() => setShowChatOnMobile(true)} />
        </aside>

        <main
          className={`flex min-h-[60vh] flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-card ${
            showChatOnMobile ? "flex" : "hidden md:flex"
          }`}
        >
          <ChatWindow onBack={() => setShowChatOnMobile(false)} />
        </main>
      </div>
    </div>
  )
}
