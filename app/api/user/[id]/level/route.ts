import { NextResponse, type NextRequest } from "next/server"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ level: "explorer", xp: 0 })
  }

  const { id } = await params
  const xp = await prisma.userXp.findUnique({
    where: { user_id: id },
    select: { level: true, xp: true },
  })

  return NextResponse.json({ level: xp?.level ?? "explorer", xp: xp?.xp ?? 0 })
}
