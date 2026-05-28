import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = z.object({ email: z.string().email() }).safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Valid email is required." }, { status: 400 })
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      create: { email: parsed.data.email, source: "footer" },
      update: { is_active: true },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    )
  }
}
