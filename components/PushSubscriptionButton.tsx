"use client"

import { useState } from "react"
import { sendNotification } from "@/utils/notifications"

import { useServiceWorker } from "@/hooks/useServiceWorker"

interface PushSubscriptionButtonProps {
  className?: string
}

export default function PushSubscriptionButton({
  className = "",
}: PushSubscriptionButtonProps) {
  const { isSubscribed, subscription, subscribeToPush, unsubscribeFromPush } =
    useServiceWorker()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubscriptionToggle() {
    setLoading(true)
    setError(null)

    try {
      if (isSubscribed) {
        await unsubscribeFromPush()
      } else {
        await subscribeToPush()
      }
    } catch (err: any) {
      setError(err.message || "操作に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  async function handleTestNotification() {
    if (!isSubscribed || !subscription) {
      setError("通知を送信するには先に購読してください")
      return
    }

    setLoading(true)
    try {
      const success = await sendNotification(
        subscription,
        "テスト通知",
        "これはプッシュ通知のテストです",
        "/dashboard"
      )

      if (!success) {
        throw new Error("通知の送信に失敗しました")
      }
    } catch (err: any) {
      setError(err.message || "通知送信に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <button
        onClick={handleSubscriptionToggle}
        disabled={loading}
        className={`rounded px-4 py-2 ${
          isSubscribed ? "bg-red-500" : "bg-blue-500"
        } text-white disabled:opacity-50`}
      >
        {loading
          ? "処理中..."
          : isSubscribed
          ? "通知を解除する"
          : "通知を受け取る"}
      </button>

      {isSubscribed && (
        <button
          onClick={handleTestNotification}
          disabled={loading}
          className="rounded bg-green-500 px-4 py-2 text-white disabled:opacity-50"
        >
          テスト通知を送信
        </button>
      )}

      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  )
}
