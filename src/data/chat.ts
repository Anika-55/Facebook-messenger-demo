import type { Conversation, Message, User } from "@/types/chat"

export const currentUserId = "user-1"

export const users: User[] = [
  {
    id: "user-1",
    name: "Ariana Lee",
    avatar: "AL",
    online: true,
  },
  {
    id: "user-2",
    name: "Devon Carter",
    avatar: "DC",
    online: true,
  },
  {
    id: "user-3",
    name: "Maya Chen",
    avatar: "MC",
    online: false,
  },
  {
    id: "user-4",
    name: "Luis Herrera",
    avatar: "LH",
    online: true,
  },
  {
    id: "user-5",
    name: "Product Team",
    avatar: "PT",
    online: true,
  },
]

const now = new Date()
const minutesAgo = (minutes: number) =>
  new Date(now.getTime() - minutes * 60_000).toISOString()

const makeMessage = (
  values: Omit<Message, "id" | "status" | "reactions"> & {
    status?: Message["status"]
    reactions?: Message["reactions"]
  },
  id: number,
): Message => ({
  id: `msg-${id}`,
  status: values.status ?? "seen",
  reactions: values.reactions ?? {},
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
          timestamp: minutesAgo(72),
        },
        1,
      ),
      makeMessage(
        {
          senderId: "user-1",
          text: "On it. I will send a quick loom after standup.",
          timestamp: minutesAgo(60),
        },
        2,
      ),
      makeMessage(
        {
          senderId: "user-2",
          text: "Perfect. I also dropped notes in the Figma comments.",
          timestamp: minutesAgo(45),
        },
        3,
      ),
      makeMessage(
        {
          senderId: "user-2",
          text: "Can we tighten the spacing on the meta row?",
          timestamp: minutesAgo(12),
        },
        4,
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
        5,
      ),
      makeMessage(
        {
          senderId: "user-1",
          text: "Sounds good. 1:00 pm?",
          timestamp: minutesAgo(300),
        },
        6,
      ),
      makeMessage(
        {
          senderId: "user-3",
          text: "Works for me. I will book a table.",
          timestamp: minutesAgo(290),
        },
        7,
      ),
    ],
  },
  {
    id: "conv-3",
    participants: ["user-1", "user-4"],
    unreadCount: 3,
    messages: [
      makeMessage(
        {
          senderId: "user-4",
          text: "Server restart is done. Metrics are stable again.",
          timestamp: minutesAgo(95),
        },
        8,
      ),
      makeMessage(
        {
          senderId: "user-4",
          text: "Any priority tasks for the afternoon?",
          timestamp: minutesAgo(90),
        },
        9,
      ),
      makeMessage(
        {
          senderId: "user-1",
          text: "Thanks. Can you watch the queue and alert if it spikes?",
          timestamp: minutesAgo(85),
        },
        10,
      ),
      makeMessage(
        {
          senderId: "user-4",
          text: "Will do. I will ping again in 30 minutes.",
          timestamp: minutesAgo(80),
        },
        11,
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
        12,
      ),
      makeMessage(
        {
          senderId: "user-1",
          text: "Got it. I will update my calendar.",
          timestamp: minutesAgo(510),
        },
        13,
      ),
    ],
  },
]
