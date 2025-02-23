"use client"

import { useEffect, useState } from "react"

import { PushSubscription } from "@/types/webpush"

export function useServiceWorker() {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  )
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered:", reg)
          return navigator.serviceWorker.ready // ← 登録完了を待つ
        })
        .then((reg) => {
          setRegistration(reg)
          return reg.pushManager.getSubscription()
        })
        .then((sub) => {
          if (sub) {
            setIsSubscribed(true)
            setSubscription(sub.toJSON() as unknown as PushSubscription)
          } else {
            const savedSubscription = localStorage.getItem("pushSubscription")
            if (savedSubscription) {
              try {
                const parsedSubscription = JSON.parse(
                  savedSubscription
                ) as PushSubscription
                setSubscription(parsedSubscription)
                setIsSubscribed(true)
              } catch (error) {
                console.error("保存された購読情報の解析に失敗:", error)
                localStorage.removeItem("pushSubscription")
              }
            }
          }
        })
        .catch((error) => console.error("Service Worker登録エラー:", error))
    }
  }, [])

  // Base64文字列をUint8Arrayに変換
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // プッシュ通知購読処理
  async function subscribeToPush(): Promise<PushSubscription> {
    try {
      if (typeof Notification === "undefined") {
        throw new Error("このブラウザは通知APIをサポートしていません。")
      }

      // 通知許可を要求
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        throw new Error("通知の許可が得られませんでした")
      }

      if (!registration) {
        throw new Error("Service Workerが登録されていません")
      }

      // VAPID公開鍵を取得
      const response = await fetch("/api/vapid-public-key")
      const vapidPublicKey = await response.text()

      // 公開鍵を適切な形式に変換
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      // プッシュサービスに登録
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      })

      // 購読情報をJSON形式に変換
      const subscriptionJson =
        pushSubscription.toJSON() as unknown as PushSubscription

      // ローカルストレージに保存
      localStorage.setItem("pushSubscription", JSON.stringify(subscriptionJson))

      setIsSubscribed(true)
      setSubscription(subscriptionJson)
      return subscriptionJson
    } catch (error) {
      console.error("プッシュ通知購読エラー:", error)
      throw error
    }
  }

  // 購読解除処理
  async function unsubscribeFromPush(): Promise<boolean> {
    try {
      if (!registration) {
        throw new Error("Service Workerが登録されていません")
      }

      const currentSubscription =
        await registration.pushManager.getSubscription()
      if (!currentSubscription) {
        // すでに購読解除されている場合
        localStorage.removeItem("pushSubscription")
        setIsSubscribed(false)
        setSubscription(null)
        return true
      }

      // プッシュサービスから購読解除
      const success = await currentSubscription.unsubscribe()

      if (success) {
        // ローカルストレージから削除
        localStorage.removeItem("pushSubscription")
        setIsSubscribed(false)
        setSubscription(null)
      }

      return success
    } catch (error) {
      console.error("購読解除エラー:", error)
      throw error
    }
  }

  return {
    isSubscribed,
    subscription,
    subscribeToPush,
    unsubscribeFromPush,
  }
}
