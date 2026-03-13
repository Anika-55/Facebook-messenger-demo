import { useState } from "react"
import ChatHeader from "@/components/chat/ChatHeader"
import MessageList from "@/components/chat/MessageList"
import MessageInput from "@/components/chat/MessageInput"

interface ChatWindowProps {
  onBack?: () => void
}

export default function ChatWindow({ onBack }: ChatWindowProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex h-full flex-1 flex-col">
      <ChatHeader
        onBack={onBack}
        isSearchOpen={isSearchOpen}
        searchValue={searchQuery}
        onSearchToggle={() => setIsSearchOpen((prev) => !prev)}
        onSearchChange={setSearchQuery}
      />
      <MessageList searchQuery={searchQuery} />
      <MessageInput />
    </div>
  )
}
