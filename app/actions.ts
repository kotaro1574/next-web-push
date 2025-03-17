"use server"

export async function sendNotification(
  message: string,
  subscription: PushSubscription
) {
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
