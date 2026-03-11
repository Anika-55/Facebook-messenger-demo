import { create } from "zustand"
import type { Conversation, Message, Reaction, User } from "@/types/chat"
import { conversations as seedConversations, users as seedUsers } from "@/data/mockData"

interface ChatState {
  conversations: Conversation[]
  users: User[]
  activeConversationId: string
  mutedConversationIds: Record<string, boolean>
  setActiveConversation: (id: string) => void
  sendMessage: (payload: { text?: string; imageUrl?: string; type?: Message["type"] }) => void
  addReaction: (messageId: string, reaction: Reaction) => void
  editMessage: (messageId: string, text: string) => void
  receiveMessage: (conversationId: string, text: string, senderId: string) => void
  startConversation: (userId: string) => void
  startGroupConversation: (userIds: string[], name?: string) => void
  toggleMuteConversation: (conversationId: string) => void
}

const currentUserId = "user-1"

export const useChatStore = create<ChatState>((set) => ({
  conversations: seedConversations,
  users: seedUsers,
  activeConversationId: seedConversations[0]?.id ?? "",
  mutedConversationIds: {},
  setActiveConversation: (id) =>
    set((state) => ({
      activeConversationId: id,
      conversations: state.conversations.map((conversation) =>
        conversation.id === id
          ? {
              ...conversation,
              unreadCount: 0,
              messages: conversation.messages.map((message) => ({
                ...message,
                status: "seen",
              })),
            }
          : conversation,
      ),
    })),
  sendMessage: (payload) =>
    set((state) => {
      const trimmed = payload.text?.trim() ?? ""
      const imageUrl = payload.imageUrl?.trim()
      const type = payload.type ?? (imageUrl ? "image" : "text")

      if (!state.activeConversationId) {
        return state
      }

      if (type === "text" && !trimmed) {
        return state
      }

      if (type === "image" && !imageUrl) {
        return state
      }

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: currentUserId,
        text: trimmed,
        type,
        imageUrl,
        timestamp: new Date().toISOString(),
        status: "sent",
        reactions: {},
      }

      const nextState = {
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id === state.activeConversationId
            ? {
                ...conversation,
                messages: [...conversation.messages, newMessage],
              }
            : conversation,
        ),
      }

      window.setTimeout(() => {
        set((current) => ({
          ...current,
          conversations: current.conversations.map((conversation) =>
            conversation.id === state.activeConversationId
              ? {
                  ...conversation,
                  messages: conversation.messages.map((message) =>
                    message.id === newMessage.id && message.status === "sent"
                      ? { ...message, status: "delivered" }
                      : message,
                  ),
                }
              : conversation,
          ),
        }))
      }, 2000)

      return nextState
    }),
  addReaction: (messageId, reaction) =>
    set((state) => ({
      ...state,
      conversations: state.conversations.map((conversation) => ({
        ...conversation,
        messages: conversation.messages.map((message) => {
          if (message.id !== messageId) {
            return message
          }

          const currentCount = message.reactions?.[reaction] ?? 0
          return {
            ...message,
            reactions: {
              ...message.reactions,
              [reaction]: currentCount + 1,
            },
          }
        }),
      })),
    })),
  editMessage: (messageId, text) =>
    set((state) => {
      const trimmed = text.trim()
      if (!trimmed) {
        return state
      }

      return {
        ...state,
        conversations: state.conversations.map((conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  text: trimmed,
                  edited: true,
                }
              : message,
          ),
        })),
      }
    }),
  receiveMessage: (conversationId, text, senderId) =>
    set((state) => {
      const trimmed = text.trim()
      if (!trimmed) {
        return state
      }

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId,
        text: trimmed,
        type: "text",
        timestamp: new Date().toISOString(),
        status: "delivered",
        reactions: {},
      }

      return {
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                unreadCount:
                  conversationId === state.activeConversationId
                    ? 0
                    : conversation.unreadCount + 1,
                messages: [...conversation.messages, newMessage],
              }
            : conversation,
        ),
      }
    }),
  startConversation: (userId) =>
    set((state) => {
      const existing = state.conversations.find(
        (conversation) =>
          !conversation.isGroup &&
          conversation.participants.includes(currentUserId) &&
          conversation.participants.includes(userId),
      )

      if (existing) {
        return {
          ...state,
          activeConversationId: existing.id,
        }
      }

      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        participants: [currentUserId, userId],
        messages: [],
        unreadCount: 0,
        isGroup: false,
      }

      return {
        ...state,
        conversations: [newConversation, ...state.conversations],
        activeConversationId: newConversation.id,
      }
    }),
  startGroupConversation: (userIds, name) =>
    set((state) => {
      const uniqueUserIds = Array.from(
        new Set([currentUserId, ...userIds.filter((id) => id !== currentUserId)]),
      )

      if (uniqueUserIds.length < 3) {
        return state
      }

      const newConversation: Conversation = {
        id: `group-${Date.now()}`,
        participants: uniqueUserIds,
        messages: [],
        unreadCount: 0,
        isGroup: true,
        name: name?.trim() || "New Group",
      }

      return {
        ...state,
        conversations: [newConversation, ...state.conversations],
        activeConversationId: newConversation.id,
      }
    }),
  toggleMuteConversation: (conversationId) =>
    set((state) => ({
      ...state,
      mutedConversationIds: {
        ...state.mutedConversationIds,
        [conversationId]: !state.mutedConversationIds[conversationId],
      },
    })),
}))
