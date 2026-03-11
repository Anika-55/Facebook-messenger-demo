export interface User {
  id: string
  name: string
  avatar: string
  online: boolean
}

export interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
  status: "sent" | "delivered" | "seen"
  reactions?: Partial<Record<Reaction, number>>
  edited?: boolean
}

export type Reaction = "👍" | "❤️" | "😂" | "😮" | "😢"

export interface Conversation {
  id: string
  participants: string[]
  messages: Message[]
  unreadCount: number
}
