export async function GET() {
  return new Response(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
}
