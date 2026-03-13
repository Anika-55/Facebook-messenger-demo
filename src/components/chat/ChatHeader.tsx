import { useState } from "react"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useChatStore } from "@/store/chatStore"
import type { Conversation, User } from "@/types/chat"

const currentUserId = "user-1"

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
    return conversation.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

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
  searchValue?: string
  isSearchOpen?: boolean
  onSearchToggle?: () => void
  onSearchChange?: (value: string) => void
}

export default function ChatHeader({
  onBack,
  searchValue = "",
  isSearchOpen = false,
  onSearchToggle,
  onSearchChange,
}: ChatHeaderProps) {
  const { resolvedTheme, theme, setTheme } = useTheme()
  const { conversations, users, activeConversationId, mutedConversationIds, toggleMuteConversation } =
    useChatStore()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  )

  const effectiveTheme = resolvedTheme ?? theme ?? "light"
  const isDark = effectiveTheme === "dark"

  const handleToggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  if (!activeConversation) {
    return (
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <p className="text-sm font-semibold">Select a conversation</p>
          <p className="text-xs text-muted-foreground">Pick a chat to get started</p>
        </div>
        <button
          type="button"
          onClick={handleToggleTheme}
          className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium"
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
    )
  }

  const title = getConversationTitle(activeConversation, users)
  const avatar = getConversationAvatar(activeConversation, users)
  const online = getOnlineStatus(activeConversation, users)
  const isMuted = Boolean(mutedConversationIds[activeConversation.id])
  const participants = activeConversation.participants
    .filter((id) => id !== currentUserId)
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user))

  return (
    <header className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{avatar}</AvatarFallback>
          </Avatar>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
              online ? "bg-emerald-500" : "bg-muted"
            }`}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge
              className={online ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}
            >
              {online ? "Online" : "Offline"}
            </Badge>
            <span>{online ? "Active now" : "Last seen recently"}</span>
            {isMuted ? <span className="text-[11px]">Muted</span> : null}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <button
          type="button"
          onClick={handleToggleTheme}
          className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium"
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
        {isSearchOpen ? (
          <input
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search messages"
            className="h-9 w-48 rounded-full border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-56"
          />
        ) : null}
        <button
          type="button"
          onClick={onSearchToggle}
          className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <span className="hidden sm:inline">Search</span>
        </button>
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className="rounded-full border border-border px-3 py-1 text-xs font-medium"
        >
          <span className="hidden sm:inline">View Profile</span>
          <span className="sm:hidden">Profile</span>
        </button>
        <button
          type="button"
          onClick={() => toggleMuteConversation(activeConversation.id)}
          className="rounded-full border border-border px-3 py-1 text-xs font-medium"
        >
          <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
          <span className="sm:hidden">{isMuted ? "On" : "Mute"}</span>
        </button>
      </div>
      {isProfileOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Profile</h3>
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="rounded-full border border-border px-2 py-1 text-xs font-medium"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {participants.length ? (
                participants.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
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
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No participants.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
