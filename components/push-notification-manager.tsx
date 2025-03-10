"use client"

import { useNotificationManager } from "@/hooks/use-notification-manager"

import { NotificationForm } from "./notification-form"
import { Button } from "./ui/button"

export function PushNotificationManager() {
  const {
    isSupported,
    subscription,
    error,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
  } = useNotificationManager()

  if (!isSupported) {
    return <p>このブラウザではプッシュ通知はサポートされていません。</p>
  }

  return (
    <div className="rounded border bg-accent p-4 shadow-sm">
      <h3 className="mb-4 text-xl font-bold">プッシュ通知</h3>

      {subscription ? (
        <>
          <p className="mb-4">プッシュ通知を購読しています。</p>
          <NotificationForm onSend={sendTestNotification} />
          <div className="mt-4">
            <Button onClick={unsubscribeFromPush} variant={"destructive"}>
              登録解除
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-4">プッシュ通知に登録されていません。</p>
          <Button onClick={subscribeToPush}>登録</Button>
        </>
      )}

      {error && (
        <p className="mt-4 rounded bg-red-50 p-2 text-red-500">{error}</p>
      )}
    </div>
  )
}
