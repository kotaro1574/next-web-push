import { PushNotificationManager } from "@/components/push-notification-manager"

export const runtime = "edge"

export default function Page() {
  return (
    <div className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <PushNotificationManager />
    </div>
  )
}
