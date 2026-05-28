import { NextResponse } from "next/server"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 })
  }

  const count = await prisma.notification.count({
    where: { user_id: session.user.id, read_at: null },
  })

  return NextResponse.json({ count })
}
