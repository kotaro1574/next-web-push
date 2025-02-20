import PushSubscriptionButton from "@/components/PushSubscriptionButton"

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <h1 className="mb-6 text-2xl font-bold">Web Push通知テスト</h1>
      <div className="rounded-lg bg-accent p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">プッシュ通知を試す</h2>
        <p className="mb-6">
          「通知を受け取る」ボタンをクリックして通知を許可してください。その後、テスト通知を送信できます。
        </p>
        <PushSubscriptionButton />
      </div>
    </section>
  )
}
