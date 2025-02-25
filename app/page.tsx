"use client"

import { useEffect, useState } from "react"

import { PushSubscription } from "@/types/webpush"
import { Button } from "@/components/ui/button"

import { sendNotification, subscribeUser, unsubscribeUser } from "./actions"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null)
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  )
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)
    }
  }, [])

  async function registerServiceWorker() {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })

      setRegistration(reg)

      const sub = await reg.pushManager.getSubscription()

      if (!sub) {
        throw new Error("プッシュ通知に登録されていません")
      }

      setSubscription(sub?.toJSON() as unknown as PushSubscription)
    } catch (error) {
      console.error("Service Worker登録エラー:", error)
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }

  async function subscribeToPush() {
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
      setSubscription(sub.toJSON() as unknown as PushSubscription)
      const serializedSub = JSON.parse(JSON.stringify(sub))
      await subscribeUser(serializedSub)
    } catch (error) {
      console.error("プッシュ通知の購読エラー:", error)
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }

  async function unsubscribeFromPush() {
    try {
      if (!registration) {
        throw new Error("Service Workerが登録されていません")
      }

      const currentSubscription =
        await registration.pushManager.getSubscription()

      if (!currentSubscription) {
        throw new Error("プッシュ通知に登録されていません")
      }

      // プッシュサービスから購読解除
      const success = await currentSubscription.unsubscribe()

      if (!success) {
        throw new Error("プッシュ通知の解除に失敗しました")
      }

      setSubscription(null)
      await unsubscribeUser()
    } catch (error) {
      console.error("プッシュ通知の解除エラー:", error)
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }

  async function sendTestNotification() {
    try {
      if (subscription) {
        await sendNotification(message)
        setMessage("")
      }
    } catch (error) {
      console.error("プッシュ通知の送信エラー:", error)
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }

  if (!isSupported) {
    return <p>このブラウザではプッシュ通知はサポートされていません。</p>
  }

  return (
    <div>
      <h3>プッシュ通知</h3>
      {subscription ? (
        <>
          <p>プッシュ通知を購読しています。</p>
          <div>
            <input
              type="text"
              placeholder="通知メッセージを入力する"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="mt-2">
            <Button onClick={sendTestNotification}>送信テスト</Button>
          </div>
          <div className="mt-2">
            <Button onClick={unsubscribeFromPush} variant={"destructive"}>
              登録解除
            </Button>
          </div>
        </>
      ) : (
        <>
          <p>プッシュ通知に登録されていません。</p>
          <Button onClick={subscribeToPush}>登録</Button>
        </>
      )}
      <Button onClick={registerServiceWorker}>ServiceWorker登録</Button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  )
}

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)
  }, [])

  if (isStandalone) {
    return null // Don't show install button if already installed
  }

  return (
    <div>
      <h3>Install App</h3>
      <Button className="mt-2">ホーム画面に追加</Button>
      {isIOS && (
        <p>
          iOSデバイスにこのアプリをインストールするには、共有ボタンをタップします。
          <span role="img" aria-label="share icon">
            {" "}
            ⎋{" "}
          </span>
          ホーム画面に追加
          <span role="img" aria-label="plus icon">
            {" "}
            ➕{" "}
          </span>
          .
        </p>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <div className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <PushNotificationManager />
      <InstallPrompt />
    </div>
  )
}
