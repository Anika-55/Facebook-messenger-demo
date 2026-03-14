const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("auth_token");
}

function buildHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(),
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }

  return response.json() as Promise<T>;
}

export const api = {
  register: (payload: { name: string; email: string; password: string; avatar?: string }) =>
    request<{ user: { id: string; name: string; email: string; avatar?: string; online: boolean } }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    ),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: { id: string; name: string; email: string; avatar?: string; online: boolean } }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    ),
  getMe: () =>
    request<{ user: { id: string; name: string; email: string; avatar?: string; online: boolean } }>("/users/me"),
  getUsers: () => request<{ users: Array<{ id: string; name: string; avatar?: string; online: boolean }> }>("/users"),
  getConversations: () =>
    request<{ conversations: Array<any> }>("/conversations"),
  createConversation: (payload: { participantIds: string[] }) =>
    request<{ conversation: any }>("/conversations", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  markConversationSeen: (conversationId: string) =>
    request<{ conversation: any }>(`/conversations/${conversationId}/seen`, {
      method: "POST"
    }),
  getMessages: (conversationId: string, params?: { page?: number; limit?: number; cursor?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.cursor) query.set("cursor", params.cursor);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<any>(`/messages/${conversationId}${suffix}`);
  },
  sendMessage: (payload: {
    conversationId: string;
    text?: string;
    imageUrl?: string;
    replyToId?: string;
    forwardFromId?: string;
  }) =>
    request<{ message: any }>("/messages", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  deleteMessage: (messageId: string) =>
    request<{ message: any }>(`/messages/${messageId}`, {
      method: "DELETE"
    }),
  updateOnline: (online: boolean) =>
    request<{ user: { id: string; name: string; avatar?: string; online: boolean } }>("/users/me/online", {
      method: "PATCH",
      body: JSON.stringify({ online })
    })
};

export const authStorage = {
  getToken,
  setToken(token: string) {
    localStorage.setItem("auth_token", token);
  },
  clearToken() {
    localStorage.removeItem("auth_token");
  }
};
