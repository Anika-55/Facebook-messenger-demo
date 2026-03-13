import { useState } from "react"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatStore } from "@/store/chatStore"
import type { Conversation, User } from "@/types/chat"

const currentUserId = "user-1"

const getInitials = (value: string) =>
  value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

const getConversationTitle = (conversation: Conversation, users: User[]) => {
  if (conversation.name) {
    return conversation.name
  }

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
  if (conversation.name) {
    return getInitials(conversation.name)
  }

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
  const { resolvedTheme, theme, setTheme } = useTheme()
  const {
    conversations,
    users,
    activeConversationId,
    setActiveConversation,
    startConversation,
    startGroupConversation,
  } = useChatStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [groupName, setGroupName] = useState("")
  const availableUsers = users.filter((user) => user.id !== currentUserId)
  const effectiveTheme = resolvedTheme ?? theme ?? "light"
  const isDark = effectiveTheme === "dark"

  const handleToggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Inbox</p>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
              {conversations.length} chats
            </span>
            <button
              type="button"
              onClick={handleToggleTheme}
              className="flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-xs font-medium"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                </svg>
              )}
              <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
            </button>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            + New Message
          </button>
          <button
            type="button"
            onClick={() => setIsGroupModalOpen(true)}
            className="w-full rounded-full border border-border px-3 py-2 text-xs font-semibold"
          >
            Create Group
          </button>
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
                <div className="relative">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback>{avatar}</AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                      conversation.participants
                        .filter((id) => id !== currentUserId)
                        .some((id) => users.find((user) => user.id === id)?.online)
                        ? "bg-emerald-500"
                        : "bg-muted"
                    }`}
                    aria-hidden="true"
                  />
                </div>
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

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Start a new chat</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-border px-2 py-1 text-xs font-medium"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    startConversation(user.id)
                    setIsModalOpen(false)
                    onSelect?.()
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-border px-3 py-2 text-left hover:bg-muted/50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{user.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.online ? "Online" : "Offline"}
                    </p>
                  </div>
                  {user.online ? (
                    <Badge className="bg-emerald-500 text-white">Online</Badge>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {isGroupModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Create group chat</h3>
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(false)}
                className="rounded-full border border-border px-2 py-1 text-xs font-medium"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-2">
              <input
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder="Group name"
                className="h-9 w-full rounded-full border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {availableUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id)
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() =>
                        setSelectedUserIds((prev) =>
                          prev.includes(user.id)
                            ? prev.filter((id) => id !== user.id)
                            : [...prev, user.id],
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left ${
                        isSelected
                          ? "border-primary/40 bg-primary/10"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{user.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.online ? "Online" : "Offline"}
                        </p>
                      </div>
                      {isSelected ? (
                        <Badge className="bg-primary text-primary-foreground">Added</Badge>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Select at least 2 people.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (selectedUserIds.length < 2) {
                    return
                  }
                  startGroupConversation(selectedUserIds, groupName)
                  setSelectedUserIds([])
                  setGroupName("")
                  setIsGroupModalOpen(false)
                  onSelect?.()
                }}
                className={`rounded-full px-4 py-2 text-xs font-semibold text-primary-foreground ${
                  selectedUserIds.length < 2
                    ? "cursor-not-allowed bg-primary/50"
                    : "bg-primary"
                }`}
                disabled={selectedUserIds.length < 2}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
