import { useState } from "react"

import { Button } from "./ui/button"

// 通知フォームコンポーネント
export function NotificationForm({
  onSend,
}: {
  onSend: (message: string) => Promise<boolean>
}) {
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const success = await onSend(message)
    if (success) {
      setMessage("")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="通知メッセージを入力する"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mr-2 w-60 rounded border p-2"
        />
      </div>
      <div className="mt-2">
        <Button type="submit">送信テスト</Button>
      </div>
    </form>
  )
}
