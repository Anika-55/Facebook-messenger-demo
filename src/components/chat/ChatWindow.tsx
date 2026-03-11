import ChatHeader from "@/components/chat/ChatHeader"
import MessageList from "@/components/chat/MessageList"
import MessageInput from "@/components/chat/MessageInput"

interface ChatWindowProps {
  onBack?: () => void
}

export default function ChatWindow({ onBack }: ChatWindowProps) {
  return (
    <div className="flex h-full flex-col">
      <ChatHeader onBack={onBack} />
      <MessageList />
      <MessageInput />
    </div>
  )
}
