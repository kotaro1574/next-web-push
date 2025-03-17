import { useCallback, useEffect, useState } from "react"

import { urlBase64ToUint8Array } from "@/lib/utils"
import { sendNotification } from "@/app/actions"

export function useNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  // Service Workerの登録
  useEffect(() => {
    const checkSupport = async () => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        setIsSupported(true)

        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })

        const sub = await registration.pushManager.getSubscription()
        setSubscription(sub)
      }
    }

    checkSupport()
  }, [])

  // 通知の購読
  const subscribeToPush = async () => {
    try {
      // 通知許可を要求
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        throw new Error("通知の許可が得られませんでした")
      }

      const registration = await navigator.serviceWorker.ready

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })
      setSubscription(sub)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }

  // 通知の購読解除
  const unsubscribeFromPush = async () => {
    try {
      if (!subscription) return
      await subscription.unsubscribe()
      setSubscription(null)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }

  // 通知の送信
  const sendTestNotification = async (message: string) => {
    try {
      if (!subscription) {
        return false
      }

      // サーバーアクションを使用して通知を送信
      const result = await sendNotification(message, subscription)

      if (!result.success) {
        throw new Error(result.error || "通知の送信に失敗しました")
      }

      return true
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      }
      return false
    }
  }

  return {
    isSupported,
    subscription,
    error,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
  }
}
