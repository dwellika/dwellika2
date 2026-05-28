import "server-only"

import { prisma } from "@/lib/prisma"
import type { ReactionTarget } from "@/lib/types/database"

export async function listCommentsFor(target: { kind: ReactionTarget; id: string }, { limit = 50 } = {}) {
  return prisma.comment.findMany({
    where: { target_kind: target.kind, target_id: target.id, is_hidden: false },
    include: {
      user: { select: { id: true, username: true, full_name: true, avatar_url: true } },
      replies: {
        where: { is_hidden: false },
        include: {
          user: { select: { id: true, username: true, full_name: true, avatar_url: true } },
        },
        orderBy: { created_at: "asc" },
      },
    },
    orderBy: { created_at: "asc" },
    take: limit,
    where: { target_kind: target.kind, target_id: target.id, is_hidden: false, parent_id: null },
  })
}
