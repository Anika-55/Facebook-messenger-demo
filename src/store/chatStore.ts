import { create } from "zustand"
import type { Conversation, Message, Reaction, User } from "@/types/chat"
import { conversations as seedConversations, users as seedUsers } from "@/data/mockData"

interface ChatState {
  conversations: Conversation[]
  users: User[]
  activeConversationId: string
  setActiveConversation: (id: string) => void
  sendMessage: (text: string) => void
  addReaction: (messageId: string, reaction: Reaction) => void
  editMessage: (messageId: string, text: string) => void
}

const currentUserId = "user-1"

export const useChatStore = create<ChatState>((set) => ({
  conversations: seedConversations,
  users: seedUsers,
  activeConversationId: seedConversations[0]?.id ?? "",
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
  sendMessage: (text) =>
    set((state) => {
      const trimmed = text.trim()
      if (!trimmed || !state.activeConversationId) {
        return state
      }

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: currentUserId,
        text: trimmed,
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
}))
