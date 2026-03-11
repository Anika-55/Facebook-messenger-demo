import { useMemo, useState, type FormEvent } from "react"
import { conversations as seedConversations, currentUserId, users } from "@/data/chat"
import type { Conversation, Message, User } from "@/types/chat"

const avatarPalette = ["#2563EB", "#9333EA", "#F97316", "#0F766E", "#16A34A", "#E11D48"]

const getUserById = (id: string) => users.find((user) => user.id === id)

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })

const formatDay = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

const getConversationTitle = (conversation: Conversation) => {
  const others = conversation.participants
    .filter((id) => id !== currentUserId)
    .map((id) => getUserById(id))
    .filter((user): user is User => Boolean(user))

  if (others.length === 1) {
    return others[0].name
  }

  return others.map((user) => user.name.split(" ")[0]).join(", ")
}

const getConversationAvatar = (conversation: Conversation) => {
  const others = conversation.participants
    .filter((id) => id !== currentUserId)
    .map((id) => getUserById(id))
    .filter((user): user is User => Boolean(user))

  if (others.length === 1) {
    return others[0].avatar
  }

  return `${others.length}`
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations)
  const [activeId, setActiveId] = useState(seedConversations[0]?.id ?? "")
  const [draft, setDraft] = useState("")
  const [search, setSearch] = useState("")
  const [showList, setShowList] = useState(true)

  const filteredConversations = useMemo(() => {
    if (!search.trim()) {
      return conversations
    }

    const query = search.toLowerCase()
    return conversations.filter((conversation) =>
      getConversationTitle(conversation).toLowerCase().includes(query),
    )
  }, [conversations, search])

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId),
    [activeId, conversations],
  )

  const activeTitle = activeConversation ? getConversationTitle(activeConversation) : "Conversation"
  const activeParticipants = activeConversation
    ? activeConversation.participants
        .filter((id) => id !== currentUserId)
        .map((id) => getUserById(id))
        .filter((user): user is User => Boolean(user))
    : []

  const handleSelectConversation = (conversationId: string) => {
    setActiveId(conversationId)
    setShowList(false)
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              unreadCount: 0,
            }
          : conversation,
      ),
    )
  }

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed || !activeId) {
      return
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      text: trimmed,
      timestamp: new Date().toISOString(),
    }

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === activeId
          ? {
              ...conversation,
              messages: [...conversation.messages, newMessage],
            }
          : conversation,
      ),
    )
    setDraft("")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Messenger Dashboard
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Conversations
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-border px-4 py-2 text-sm font-medium">
              New message
            </button>
            <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Create group
            </button>
          </div>
        </div>

        <section className="flex min-h-[72vh] flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm md:grid md:grid-cols-[320px_minmax(0,1fr)]">
          <aside
            className={`flex flex-col border-border md:border-r ${
              showList ? "flex" : "hidden md:flex"
            }`}
          >
            <div className="border-b border-border p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Inbox</h2>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {conversations.length} chats
                </span>
              </div>
              <div className="mt-4">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search conversations"
                  className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {filteredConversations.map((conversation, index) => {
                  const lastMessage = conversation.messages[conversation.messages.length - 1]
                  const title = getConversationTitle(conversation)
                  const avatarLabel = getConversationAvatar(conversation)
                  const isActive = conversation.id === activeId

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                        isActive
                          ? "border-primary/40 bg-primary/10"
                          : "border-transparent hover:border-border hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold text-white"
                        style={{ backgroundColor: avatarPalette[index % avatarPalette.length] }}
                      >
                        {avatarLabel}
                        {conversation.unreadCount > 0 ? (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold">{title}</p>
                          {lastMessage ? (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(lastMessage.timestamp)}
                            </span>
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {lastMessage?.text ?? "No messages yet"}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          <div className={`flex flex-1 flex-col ${showList ? "hidden md:flex" : "flex"}`}>
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowList(true)}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium md:hidden"
                >
                  Back
                </button>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{activeTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {activeParticipants.length
                      ? `${activeParticipants.length} participant${activeParticipants.length > 1 ? "s" : ""}`
                      : "Direct message"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-full border border-border px-3 py-1 text-xs font-medium">
                  View profile
                </button>
                <button className="rounded-full border border-border px-3 py-1 text-xs font-medium">
                  Mute
                </button>
              </div>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {activeConversation?.messages.map((message, index) => {
                const isMine = message.senderId === currentUserId
                const sender = getUserById(message.senderId)
                const isFirst =
                  index === 0 ||
                  activeConversation.messages[index - 1].senderId !== message.senderId

                return (
                  <div
                    key={message.id}
                    className={`flex flex-col gap-2 ${isMine ? "items-end" : "items-start"}`}
                  >
                    {isFirst && !isMine ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{sender?.name}</span>
                        <span>{formatDay(message.timestamp)}</span>
                      </div>
                    ) : null}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        isMine
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {message.text}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                )
              })}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="border-t border-border px-6 py-4"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type a message"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
