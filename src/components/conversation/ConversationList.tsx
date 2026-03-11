import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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

const formatTime = (value?: string) => {
  if (!value) {
    return ""
  }

  return new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface ConversationListProps {
  onSelect?: () => void
}

export default function ConversationList({ onSelect }: ConversationListProps) {
  const { conversations, users, activeConversationId, setActiveConversation } = useChatStore()

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Inbox</p>
          <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
            {conversations.length} chats
          </span>
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const lastMessage = conversation.messages[conversation.messages.length - 1]
            const isActive = conversation.id === activeConversationId
            const title = getConversationTitle(conversation, users)
            const avatar = getConversationAvatar(conversation, users)

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => {
                  setActiveConversation(conversation.id)
                  onSelect?.()
                }}
                className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                  isActive
                    ? "border-primary/40 bg-primary/10"
                    : "border-transparent hover:border-border hover:bg-muted/50"
                }`}
              >
                <Avatar className="h-11 w-11">
                  <AvatarFallback>{avatar}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{title}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(lastMessage?.timestamp)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {lastMessage?.text ?? "No messages yet"}
                  </p>
                </div>
                {conversation.unreadCount > 0 ? (
                  <Badge>{conversation.unreadCount}</Badge>
                ) : null}
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
