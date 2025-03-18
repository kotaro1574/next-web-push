import { NextResponse } from "next/server"
import webpush from "web-push"

// VAPIDの設定
webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, subscription } = body

    if (!message || !subscription) {
      return NextResponse.json(
        { error: "message と subscription は必須です" },
        { status: 400 }
      )
    }

    // 通知の送信
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "テスト通知",
        body: message,
      })
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("プッシュ通知の送信エラー:", error)

    const status =
      error instanceof webpush.WebPushError ? error.statusCode : 500

    return NextResponse.json(
      {
        success: false,
        error: "通知の送信に失敗しました",
      },
      { status }
    )
  }
}
