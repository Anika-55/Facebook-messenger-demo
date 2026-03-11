import type { Conversation, Message, User } from "@/types/chat"

export const users: User[] = [
  { id: "user-1", name: "Ariana Lee", avatar: "AL", online: true },
  { id: "user-2", name: "Devon Carter", avatar: "DC", online: true },
  { id: "user-3", name: "Maya Chen", avatar: "MC", online: false },
  { id: "user-4", name: "Luis Herrera", avatar: "LH", online: true },
  { id: "user-5", name: "Product Team", avatar: "PT", online: true },
  { id: "user-6", name: "Nina Park", avatar: "NP", online: false },
]

const now = new Date()
const minutesAgo = (minutes: number) =>
  new Date(now.getTime() - minutes * 60_000).toISOString()

const makeMessage = (
  values: Omit<Message, "id" | "status" | "reactions" | "type" | "imageUrl"> & {
    status?: Message["status"]
    reactions?: Message["reactions"]
    type?: Message["type"]
    imageUrl?: Message["imageUrl"]
  },
  id: number,
): Message => ({
  id: `msg-${id}`,
  type: values.type ?? "text",
  status: values.status ?? "seen",
  reactions: values.reactions ?? {},
  imageUrl: values.imageUrl,
  ...values,
})

export const conversations: Conversation[] = [
  {
    id: "conv-1",
    participants: ["user-1", "user-2"],
    unreadCount: 2,
    messages: [
      makeMessage(
        {
          senderId: "user-2",
          text: "Morning! Can you review the event card layout?",
          timestamp: minutesAgo(120),
        },
        1,
      ),
      makeMessage(
        {
          senderId: "user-1",
          text: "On it. I will send a quick loom after standup.",
          timestamp: minutesAgo(100),
        },
        2,
      ),
      makeMessage(
        {
          senderId: "user-2",
          text: "Perfect. I also dropped notes in the Figma comments.",
          timestamp: minutesAgo(80),
        },
        3,
      ),
    ],
  },
  {
    id: "conv-2",
    participants: ["user-1", "user-3"],
    unreadCount: 0,
    messages: [
      makeMessage(
        {
          senderId: "user-3",
          text: "Lunch later? I found a new cafe near the office.",
          timestamp: minutesAgo(320),
        },
        4,
      ),
      makeMessage(
        {
          senderId: "user-1",
          text: "Sounds good. 1:00 pm?",
          timestamp: minutesAgo(300),
        },
        5,
      ),
      makeMessage(
        {
          senderId: "user-3",
          text: "Works for me. I will book a table.",
          timestamp: minutesAgo(280),
        },
        6,
      ),
    ],
  },
  {
    id: "conv-3",
    participants: ["user-1", "user-4"],
    unreadCount: 1,
    messages: [
      makeMessage(
        {
          senderId: "user-4",
          text: "Server restart is done. Metrics are stable again.",
          timestamp: minutesAgo(95),
        },
        7,
      ),
      makeMessage(
        {
          senderId: "user-1",
          text: "Thanks. Can you watch the queue and alert if it spikes?",
          timestamp: minutesAgo(85),
        },
        8,
      ),
      makeMessage(
        {
          senderId: "user-4",
          text: "Will do. I will ping again in 30 minutes.",
          timestamp: minutesAgo(70),
        },
        9,
      ),
    ],
  },
  {
    id: "conv-4",
    participants: ["user-1", "user-5"],
    unreadCount: 0,
    messages: [
      makeMessage(
        {
          senderId: "user-5",
          text: "Weekly product sync moved to Friday 10am.",
          timestamp: minutesAgo(520),
        },
        10,
      ),
      makeMessage(
        {
          senderId: "user-1",
          text: "Got it. I will update my calendar.",
          timestamp: minutesAgo(510),
        },
        11,
      ),
      makeMessage(
        {
          senderId: "user-5",
          text: "I also shared the roadmap draft. Please review.",
          timestamp: minutesAgo(480),
        },
        12,
      ),
    ],
  },
  {
    id: "conv-5",
    participants: ["user-1", "user-6"],
    unreadCount: 3,
    messages: [
      makeMessage(
        {
          senderId: "user-6",
          text: "Can you help with the onboarding checklist?",
          timestamp: minutesAgo(45),
        },
        13,
      ),
      makeMessage(
        {
          senderId: "user-1",
          text: "Sure. I can review it after this meeting.",
          timestamp: minutesAgo(40),
        },
        14,
      ),
      makeMessage(
        {
          senderId: "user-6",
          text: "Thanks! I will send you the draft in a few minutes.",
          timestamp: minutesAgo(35),
        },
        15,
      ),
    ],
  },
]
