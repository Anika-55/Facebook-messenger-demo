import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useChatStore } from "@/store/chatStore"
import type { Conversation, User } from "@/types/chat"

const currentUserId = "user-1"

const getConversationTitle = (conversation: Conversation, users: User[]) => {
  const others = conversation.participants
    .filter((id) => id !== currentUserId)
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user))

  if (others.length === 0) {
    return "Conversation"
  }

  if (others.length === 1) {
    return others[0].name
  }

  return others.map((user) => user.name.split(" ")[0]).join(", ")
}

const getConversationAvatar = (conversation: Conversation, users: User[]) => {
  const other = conversation.participants.find((id) => id !== currentUserId)
  const user = users.find((item) => item.id === other)
  return user?.avatar ?? "?"
}

const getOnlineStatus = (conversation: Conversation, users: User[]) => {
  const other = conversation.participants.find((id) => id !== currentUserId)
  const user = users.find((item) => item.id === other)
  return user?.online ?? false
}

interface ChatHeaderProps {
  onBack?: () => void
}

export default function ChatHeader({ onBack }: ChatHeaderProps) {
  const { conversations, users, activeConversationId } = useChatStore()
  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  )

  if (!activeConversation) {
    return (
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-sm font-semibold">Select a conversation</p>
          <p className="text-xs text-muted-foreground">Pick a chat to get started</p>
        </div>
      </div>
    )
  }

  const title = getConversationTitle(activeConversation, users)
  const avatar = getConversationAvatar(activeConversation, users)
  const online = getOnlineStatus(activeConversation, users)

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-border px-3 py-1 text-xs font-medium md:hidden"
          >
            Back
          </button>
        ) : null}
        <Avatar className="h-10 w-10">
          <AvatarFallback>{avatar}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge
              className={online ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}
            >
              {online ? "Online" : "Offline"}
            </Badge>
            <span>{online ? "Active now" : "Last seen recently"}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-full border border-border px-3 py-1 text-xs font-medium">
          Call
        </button>
        <button className="rounded-full border border-border px-3 py-1 text-xs font-medium">
          Info
        </button>
      </div>
    </header>
  )
}
