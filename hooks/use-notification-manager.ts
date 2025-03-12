import { useCallback, useEffect, useState } from "react"
// web-pushのPushSubscriptionをWebPushSubscriptionとしてインポート
import { PushSubscription as WebPushSubscription } from "web-push"

import { urlBase64ToUint8Array } from "@/lib/utils"
import { sendNotification, subscribeUser, unsubscribeUser } from "@/app/actions"

export function useNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  // ブラウザのPushSubscriptionを使用
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  // エラーハンドリングのヘルパー関数
  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`${context}:`, error)
    setError(
      error instanceof Error
        ? error.message
        : `${context}でエラーが発生しました`
    )
  }, [])

  // Service Workerの登録
  const registerServiceWorker = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })

      if (!registration) {
        throw new Error("Service Workerが登録されていません")
      }

      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
      console.log("Subscription:", sub)
      return registration
    } catch (error) {
      handleError(error, "Service Worker登録エラー")
      return null
    }
  }, [handleError])

  // 通知の購読
  const subscribeToPush = async () => {
    try {
      if (typeof Notification === "undefined") {
        throw new Error("このブラウザは通知APIをサポートしていません。")
      }

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
      const serializedSub = JSON.parse(JSON.stringify(sub))
      await subscribeUser(serializedSub as unknown as WebPushSubscription)
    } catch (error) {
      handleError(error, "プッシュ通知の購読エラー")
    }
  }

  // 通知の購読解除
  const unsubscribeFromPush = async () => {
    try {
      if (!subscription) return
      await subscription.unsubscribe()
      setSubscription(null)
      await unsubscribeUser()
    } catch (error) {
      handleError(error, "プッシュ通知の解除エラー")
    }
  }

  // 通知の送信
  const sendTestNotification = async (message: string) => {
    try {
      if (subscription) {
        await sendNotification(message)
        return true
      }
      return false
    } catch (error) {
      handleError(error, "プッシュ通知の送信エラー")
      return false
    }
  }

  // 初期化
  useEffect(() => {
    const checkSupport = async () => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        setIsSupported(true)
        await registerServiceWorker()
      }
    }

    checkSupport()
  }, [registerServiceWorker])

  return {
    isSupported,
    subscription,
    error,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
  }
}
