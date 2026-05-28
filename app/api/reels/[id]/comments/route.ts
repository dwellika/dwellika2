import { NextResponse } from "next/server"
import { getApiSession } from "@/lib/api/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const comments = await prisma.comment.findMany({
      where: {
        target_kind: "reel",
        target_id: id,
        is_hidden: false,
        parent_id: null,
      },
      select: {
        id: true,
        body: true,
        like_count: true,
        created_at: true,
        user: {
          select: {
            id: true,
            username: true,
            full_name: true,
            avatar_url: true,
          },
        },
        replies: {
          where: { is_hidden: false },
          select: {
            id: true,
            body: true,
            created_at: true,
            user: {
              select: {
                id: true,
                username: true,
                full_name: true,
                avatar_url: true,
              },
            },
          },
          orderBy: { created_at: "asc" },
          take: 3,
        },
      },
      orderBy: { created_at: "desc" },
      take: 50,
    })
    return NextResponse.json({ ok: true, comments })
  } catch {
    return NextResponse.json({ ok: false, comments: [] })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const session = await getApiSession()
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Sign in to comment" },
        { status: 401 },
      )
    }

    const { body } = await request.json()
    if (!body?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Empty comment" },
        { status: 400 },
      )
    }

    const comment = await prisma.comment.create({
      data: {
        user_id: session.userId,
        target_kind: "reel",
        target_id: id,
        body: body.trim(),
      },
      select: {
        id: true,
        body: true,
        like_count: true,
        created_at: true,
        user: {
          select: {
            id: true,
            username: true,
            full_name: true,
            avatar_url: true,
          },
        },
        replies: { select: { id: true } },
      },
    })

    await prisma.reel
      .update({
        where: { id },
        data: { comment_count: { increment: 1 } },
      })
      .catch(() => {})

    return NextResponse.json({ ok: true, comment })
  } catch {
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 })
  }
}
