import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChatStore } from "@/store/chatStore"

export default function MessageInput() {
  const [value, setValue] = useState("")
  const sendMessage = useChatStore((state) => state.sendMessage)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!value.trim()) {
      return
    }

    sendMessage(value)
    setValue("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border px-6 py-4"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-2">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Type a message"
          className="h-9 border-0 bg-transparent px-0 focus:ring-0"
        />
        <Button type="submit" className="rounded-full">
          Send
        </Button>
      </div>
    </form>
  )
}
