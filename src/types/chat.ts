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
  deletedAt?: string | null
  replyTo?: MessagePreview
  forwardedFrom?: MessagePreview
  reactions?: Partial<Record<Reaction, number>>
  edited?: boolean
}

export interface MessagePreview {
  id: string
  senderId: string
  text: string
  imageUrl?: string
  deletedAt?: string | null
}

export interface Conversation {
  id: string
  participants: string[]
  messages: Message[]
  unreadCount: number
  name?: string
  avatar?: string
  isGroup?: boolean
}
