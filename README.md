# Messenger UI Clone

A polished, responsive Facebook Messenger style UI built with React, TypeScript, and Vite. The app ships with seeded conversations, message reactions, search, and rich composition tools to showcase modern chat UI interactions.

**Features**
- Inbox with conversation list, unread badges, and online status indicators
- Light and dark theme toggle
- Start new 1:1 conversations or create group chats
- Chat window with message search and highlighted results
- Typing indicator plus simulated incoming messages
- Compose messages with emoji picker and image upload previews
- Message status labels (sent, delivered, seen)
- Edit sent messages and add emoji reactions
- Mute conversations and view participant profiles
- Responsive layout with mobile back navigation

**Tech Stack**
- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- Zustand state management
- `next-themes`, `emoji-picker-react`, shadcn/ui components

**Getting Started**
```bash
cd client
npm install
npm run dev
```
Open the dev server URL shown in the terminal.

**Scripts**
```bash
npm run dev      # Start dev server
npm run build    # Typecheck + production build
npm run preview  # Preview production build
npm run lint     # Lint the codebase
```

**Project Structure**
- `client/src/pages/MessengerPage.tsx` - Layout and mobile behavior
- `client/src/components/chat` - Chat header, message list, bubbles, input
- `client/src/components/conversation` - Inbox and new chat flows
- `client/src/store/chatStore.ts` - Zustand store and chat actions
- `client/src/data/mockData.ts` - Seeded users, conversations, messages
- `client/src/index.css` - Global styles and Tailwind setup

**State + Data Notes**
- All data is local and sourced from `client/src/data/mockData.ts`.
- Incoming messages are simulated every 12 seconds.
- Outgoing messages update from `sent` to `delivered` after 2 seconds.
- There is no backend or persistence layer yet.

**Customization**
- Edit `client/src/data/mockData.ts` to change the seeded conversations.
- Adjust styles in `client/src/index.css` or Tailwind config (`client/tailwind.config.ts`).
