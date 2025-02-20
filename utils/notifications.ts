export async function sendNotification(
  subscription: any,
  title: string,
  body: string,
  url: string = "/"
): Promise<boolean> {
  try {
    const response = await fetch("/api/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription,
        notification: {
          title,
          body,
          url,
        },
      }),
    })

    if (!response.ok) {
      throw new Error("通知送信リクエストが失敗しました")
    }

    return true
  } catch (error) {
    console.error("通知送信エラー:", error)
    return false
  }
}
