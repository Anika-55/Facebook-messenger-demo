export interface User {
  id: string
  name: string
  avatar: string
  online: boolean
}

export type Reaction = "👍" | "❤️" | "😂" | "😮" | "😢"

export interface Message {
  id: string
  senderId: string
  text: string
  type: "text" | "image"
  imageUrl?: string
  timestamp: string
  status: "sent" | "delivered" | "seen"
  reactions?: Partial<Record<Reaction, number>>
  edited?: boolean
}

export interface Conversation {
  id: string
  participants: string[]
  messages: Message[]
  unreadCount: number
  name?: string
  isGroup?: boolean
}
