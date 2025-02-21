import { NextResponse } from "next/server"
import webpush from "web-push"

import { NotificationPayload, PushSubscription } from "@/types/webpush"

export const runtime = "edge"

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      subscription: PushSubscription
      notification: NotificationPayload
    }

    const { subscription, notification } = payload

    if (!subscription || !notification) {
      return NextResponse.json(
        { error: "必要なデータが不足しています" },
        { status: 400 }
      )
    }

    // VAPID資格情報の設定
    webpush.setVapidDetails(
      "mailto:youremail@example.com", // 連絡先メールアドレス
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
      process.env.VAPID_PRIVATE_KEY || ""
    )

    // 通知を送信
    await webpush.sendNotification(subscription, JSON.stringify(notification))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("通知送信エラー:", error)
    return NextResponse.json(
      { error: "通知の送信に失敗しました" },
      { status: 500 }
    )
  }
}
