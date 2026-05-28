export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 })
  }

  const { chatId } = await params
  const after = request.nextUrl.searchParams.get("after") ?? ""

  // Verify participation
  const participation = await prisma.chatParticipant.findUnique({
    where: { chat_id_user_id: { chat_id: chatId, user_id: session.user.id } },
  })
  if (!participation) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
  }

  const messages = await prisma.chatMessage.findMany({
    where: {
      chat_id: chatId,
      is_deleted: false,
      ...(after ? { id: { gt: after } } : {}),
    },
    orderBy: { created_at: "asc" },
    take: 50,
  })

  return NextResponse.json({ messages })
}
