import { create } from "zustand";
import type { Conversation, Message, MessagePreview, Reaction, User } from "@/types/chat";
import { api, authStorage } from "@/lib/api";

interface ChatState {
  conversations: Conversation[];
  users: User[];
  activeConversationId: string;
  mutedConversationIds: Record<string, boolean>;
  currentUserId: string;
  isLoading: boolean;
  authError: string | null;
  replyTarget: Message | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; avatar?: string }) => Promise<void>;
  logout: () => void;
  setActiveConversation: (id: string) => Promise<void>;
  sendMessage: (payload: { text?: string; imageUrl?: string; type?: Message["type"] }) => Promise<void>;
  addReaction: (messageId: string, reaction: Reaction) => void;
  editMessage: (messageId: string, text: string) => void;
  deleteMessage: (messageId: string) => Promise<void>;
  setReplyTarget: (message: Message | null) => void;
  forwardMessage: (messageId: string, conversationId: string) => Promise<void>;
  startConversation: (userId: string) => Promise<void>;
  startGroupConversation: (userIds: string[], name?: string) => Promise<void>;
  toggleMuteConversation: (conversationId: string) => void;
}

const mapPreview = (message?: any): MessagePreview | undefined => {
  if (!message) {
    return undefined;
  }
  return {
    id: message.id,
    senderId: message.senderId,
    text: message.text ?? "",
    imageUrl: message.imageUrl ?? undefined,
    deletedAt: message.deletedAt ?? null
  };
};

const mapMessage = (message: any): Message => ({
  id: message.id,
  senderId: message.senderId,
  text: message.text ?? "",
  type: message.imageUrl ? "image" : "text",
  imageUrl: message.imageUrl ?? undefined,
  timestamp: message.createdAt,
  status: message.status ?? "sent",
  deletedAt: message.deletedAt ?? null,
  replyTo: mapPreview(message.replyTo),
  forwardedFrom: mapPreview(message.forwardedFrom),
  reactions: {}
});

const mapConversation = (conversation: any): Conversation => {
  const participants = conversation.participants?.map((entry: any) => entry.user?.id ?? entry.userId ?? entry) ?? [];
  const lastMessage = conversation.lastMessage ? mapMessage(conversation.lastMessage) : null;

  return {
    id: conversation.id,
    participants,
    messages: lastMessage ? [lastMessage] : [],
    unreadCount: conversation.unreadCount ?? 0,
    isGroup: participants.length > 2,
    name: conversation.name,
    avatar: conversation.avatar ?? undefined
  };
};

const mapUsers = (users: Array<any>): User[] =>
  users.map((user) => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar ?? user.name.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase(),
    online: user.online ?? false
  }));

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  users: [],
  activeConversationId: "",
  mutedConversationIds: {},
  currentUserId: "",
  isLoading: false,
  authError: null,
  replyTarget: null,
  initialize: async () => {
    const token = authStorage.getToken();
    if (!token) {
      set({ conversations: [], users: [], activeConversationId: "", currentUserId: "" });
      return;
    }

    set({ isLoading: true, authError: null });
    try {
      const [me, usersResponse, conversationsResponse] = await Promise.all([
        api.getMe(),
        api.getUsers(),
        api.getConversations()
      ]);

      const users = mapUsers(usersResponse.users);
      const meUser = me.user;
      const normalizedUsers = users.some((u) => u.id === meUser.id)
        ? users
        : [...users, mapUsers([meUser])[0]];

      const conversations = conversationsResponse.conversations.map(mapConversation);
      const activeConversationId = conversations[0]?.id ?? "";

      set({
        currentUserId: meUser.id,
        users: normalizedUsers,
        conversations,
        activeConversationId
      });

      if (activeConversationId) {
        await get().setActiveConversation(activeConversationId);
      }
    } catch (error) {
      set({ authError: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  login: async (email, password) => {
    set({ isLoading: true, authError: null });
    try {
      const response = await api.login({ email, password });
      authStorage.setToken(response.token);
      await get().initialize();
    } catch (error) {
      set({ authError: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  register: async (payload) => {
    set({ isLoading: true, authError: null });
    try {
      await api.register(payload);
      await get().login(payload.email, payload.password);
    } catch (error) {
      set({ authError: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  logout: () => {
    authStorage.clearToken();
    set({
      conversations: [],
      users: [],
      activeConversationId: "",
      currentUserId: "",
      replyTarget: null
    });
  },
  setActiveConversation: async (id) => {
    set({ activeConversationId: id });
    if (!id) {
      return;
    }

    try {
      await api.markConversationSeen(id);
      const response = await api.getMessages(id, { limit: 30 });
      const messages = response.messages.map(mapMessage);

      set((state) => ({
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id === id
            ? {
                ...conversation,
                messages
              }
            : conversation
        )
      }));
      set({ replyTarget: null });
    } catch {
      // ignore
    }
  },
  sendMessage: async (payload) => {
    const { activeConversationId, currentUserId, replyTarget } = get();
    const trimmed = payload.text?.trim() ?? "";
    const imageUrl = payload.imageUrl?.trim() ?? "";
    const type = payload.type ?? (imageUrl ? "image" : "text");

    if (!activeConversationId || (!trimmed && !imageUrl)) {
      return;
    }

    const tempId = `tmp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      senderId: currentUserId,
      text: trimmed,
      type,
      imageUrl: imageUrl || undefined,
      timestamp: new Date().toISOString(),
      status: "sent",
      deletedAt: null,
      replyTo: replyTarget ? mapPreview(replyTarget) : undefined,
      forwardedFrom: undefined,
      reactions: {}
    };

    set((state) => ({
      ...state,
      conversations: state.conversations.map((conversation) =>
        conversation.id === activeConversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, optimisticMessage]
            }
          : conversation
      )
    }));

    try {
      const response = await api.sendMessage({
        conversationId: activeConversationId,
        text: trimmed || undefined,
        imageUrl: imageUrl || undefined,
        replyToId: replyTarget?.id
      });
      const message = mapMessage(response.message);

      set((state) => ({
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id === activeConversationId
            ? {
                ...conversation,
                messages: conversation.messages.map((item) =>
                  item.id === tempId ? message : item
                )
              }
            : conversation
        )
      }));
      set({ replyTarget: null });
    } catch (error) {
      set((state) => ({
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id === activeConversationId
            ? {
                ...conversation,
                messages: conversation.messages.filter((item) => item.id !== tempId)
              }
            : conversation
        ),
        authError: (error as Error).message
      }));
    }

    if (currentUserId) {
      try {
        await api.updateOnline(true);
      } catch {
        // ignore
      }
    }
  },
  deleteMessage: async (messageId) => {
    try {
      const response = await api.deleteMessage(messageId);
      const updated = mapMessage(response.message);
      set((state) => ({
        ...state,
        conversations: state.conversations.map((conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === messageId ? updated : message
          )
        }))
      }));
    } catch (error) {
      set({ authError: (error as Error).message });
    }
  },
  setReplyTarget: (message) => set({ replyTarget: message }),
  forwardMessage: async (messageId, conversationId) => {
    if (!messageId) {
      return;
    }
    try {
      const response = await api.sendMessage({
        conversationId,
        forwardFromId: messageId
      });
      const message = mapMessage(response.message);
      set((state) => ({
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, messages: [...conversation.messages, message] }
            : conversation
        )
      }));
    } catch (error) {
      set({ authError: (error as Error).message });
    }
  },
  addReaction: (messageId, reaction) =>
    set((state) => ({
      ...state,
      conversations: state.conversations.map((conversation) => ({
        ...conversation,
        messages: conversation.messages.map((message) => {
          if (message.id !== messageId) {
            return message;
          }

          const currentCount = message.reactions?.[reaction] ?? 0;
          return {
            ...message,
            reactions: {
              ...message.reactions,
              [reaction]: currentCount + 1
            }
          };
        })
      }))
    })),
  editMessage: (messageId, text) =>
    set((state) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return state;
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
                  edited: true
                }
              : message
          )
        }))
      };
    }),
  startConversation: async (userId) => {
    const response = await api.createConversation({ participantIds: [userId] });
    const conversation = mapConversation(response.conversation);

    set((state) => {
      const existing = state.conversations.find((item) => item.id === conversation.id);
      const conversations = existing
        ? state.conversations.map((item) => (item.id === conversation.id ? conversation : item))
        : [conversation, ...state.conversations];

      return {
        ...state,
        conversations,
        activeConversationId: conversation.id
      };
    });

    await get().setActiveConversation(conversation.id);
  },
  startGroupConversation: async (userIds) => {
    const response = await api.createConversation({ participantIds: userIds });
    const conversation = mapConversation(response.conversation);

    set((state) => ({
      ...state,
      conversations: [conversation, ...state.conversations],
      activeConversationId: conversation.id
    }));

    await get().setActiveConversation(conversation.id);
  },
  toggleMuteConversation: (conversationId) =>
    set((state) => ({
      ...state,
      mutedConversationIds: {
        ...state.mutedConversationIds,
        [conversationId]: !state.mutedConversationIds[conversationId]
      }
    }))
}));
