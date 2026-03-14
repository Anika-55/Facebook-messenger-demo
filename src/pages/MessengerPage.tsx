import { useEffect, useState } from "react"
import ChatWindow from "@/components/chat/ChatWindow"
import ConversationList from "@/components/conversation/ConversationList"
import { useChatStore } from "@/store/chatStore"

export default function MessengerPage() {
  const {
    activeConversationId,
    initialize,
    login,
    register,
    logout,
    currentUserId,
    isLoading,
    authError
  } = useChatStore()
  const [showChatOnMobile, setShowChatOnMobile] = useState(Boolean(activeConversationId))
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    avatar: ""
  })

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!currentUserId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Messenger</h1>
            <button
              type="button"
            onClick={() => {
              setAuthMode((mode) => (mode === "login" ? "register" : "login"))
              setFormValues({ name: "", email: "", password: "", avatar: "" })
            }}
              className="text-xs font-medium text-primary"
            >
              {authMode === "login" ? "Create account" : "I have an account"}
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {authMode === "register" ? (
              <input
                value={formValues.name}
                onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Name"
                className="h-10 w-full rounded-full border border-border bg-background px-4 text-sm"
              />
            ) : null}
            <input
              value={formValues.email}
              onChange={(event) => setFormValues((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Email"
              className="h-10 w-full rounded-full border border-border bg-background px-4 text-sm"
            />
            <input
              value={formValues.password}
              onChange={(event) => setFormValues((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Password"
              type="password"
              className="h-10 w-full rounded-full border border-border bg-background px-4 text-sm"
            />
            {authMode === "register" ? (
              <input
                value={formValues.avatar}
                onChange={(event) => setFormValues((prev) => ({ ...prev, avatar: event.target.value }))}
                placeholder="Avatar URL (optional)"
                className="h-10 w-full rounded-full border border-border bg-background px-4 text-sm"
              />
            ) : null}
          </div>

          {authError ? <p className="mt-3 text-xs text-red-500">{authError}</p> : null}

          <button
            type="button"
            disabled={isLoading}
            onClick={async () => {
              if (authMode === "login") {
                await login(formValues.email, formValues.password)
              } else {
                await register({
                  name: formValues.name,
                  email: formValues.email,
                  password: formValues.password,
                  avatar: formValues.avatar || undefined
                })
              }
              setFormValues({ name: "", email: "", password: "", avatar: "" })
            }}
            className="mt-4 w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {isLoading ? "Please wait..." : authMode === "login" ? "Login" : "Register"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <div className="flex h-full overflow-hidden">
        <aside
          className={`h-full w-[320px] shrink-0 border-r border-border ${
            showChatOnMobile ? "hidden md:block" : "block"
          }`}
        >
          <ConversationList onSelect={() => setShowChatOnMobile(true)} />
        </aside>

        <main
          className={`flex h-full flex-1 flex-col overflow-hidden ${
            showChatOnMobile ? "flex" : "hidden md:flex"
          }`}
        >
          <ChatWindow onBack={() => setShowChatOnMobile(false)} />
        </main>
      </div>
      <button
        type="button"
        onClick={logout}
        className="fixed bottom-4 left-4 hidden rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold md:block"
      >
        Logout
      </button>
    </div>
  )
}
