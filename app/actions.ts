"use server"

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

  if (!process.env.NOTIFICATION_API_ENDPOINT) {
    console.error("NOTIFICATION_API_ENDPOINTが設定されていません")
    return { success: false, error: "サーバー設定エラー" }
  }

  try {
    const serializedSub = JSON.parse(JSON.stringify(subscription))

    const response = await fetch(process.env.NOTIFICATION_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        subscription: serializedSub,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "通知の送信に失敗しました",
      }
    }

    return { success: true }
  } catch (error) {
    console.error("プッシュ通知の送信エラー:", error)
    return { success: false, error: "通知の送信に失敗" }
  }
}
