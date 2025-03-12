"use server"

import webpush, { PushSubscription } from "web-push"

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

let subscription: PushSubscription | null = null

export async function subscribeUser(sub: PushSubscription) {
  subscription = sub
  console.log("🚨", subscription)
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true }
}

export async function unsubscribeUser() {
  subscription = null
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true }
}

export async function sendNotification(message: string) {
  if (!subscription) {
    return { success: false, error: "購読不可" }
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "テスト通知",
        body: message,
      })
    )
    return { success: true }
  } catch (error) {
    console.error("プッシュ通知の送信エラー:", error)
    return { success: false, error: "通知の送信に失敗" }
  }
}
