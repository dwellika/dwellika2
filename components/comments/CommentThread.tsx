import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { renderMentions } from "@/lib/text"
import { listCommentsFor } from "@/lib/data/comments"
import type { ReactionTarget } from "@/lib/types/database"

import { CommentComposer } from "./CommentComposer"

interface CommentThreadProps {
  targetKind: ReactionTarget
  targetId: string
  isAuthed: boolean
  currentUserId?: string
}

export async function CommentThread({
  targetKind,
  targetId,
  isAuthed,
  currentUserId,
}: CommentThreadProps) {
  const comments = await listCommentsFor({ kind: targetKind, id: targetId }, { limit: 100 })
  const roots = comments.filter((c) => !c.parent_id)
  const repliesByParent = comments.reduce<Record<string, typeof comments>>((acc, c) => {
    if (c.parent_id) (acc[c.parent_id] ??= []).push(c)
    return acc
  }, {})

  return (
    <section className="space-y-5">
      <h2 className="font-display text-2xl">
        Comments {comments.length > 0 ? <span className="text-muted-foreground">· {comments.length}</span> : null}
      </h2>

      <CommentComposer targetKind={targetKind} targetId={targetId} isAuthed={isAuthed} />

      {roots.length === 0 ? (
        <p className="text-sm text-muted-foreground">Be the first to comment.</p>
      ) : (
        <ul className="space-y-4">
          {roots.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              replies={repliesByParent[c.id] ?? []}
              isAuthed={isAuthed}
              currentUserId={currentUserId}
              targetKind={targetKind}
              targetId={targetId}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

interface CommentNodeProps {
  comment: Awaited<ReturnType<typeof listCommentsFor>>[number]
  replies: Awaited<ReturnType<typeof listCommentsFor>>
  isAuthed: boolean
  currentUserId?: string
  targetKind: ReactionTarget
  targetId: string
}

function CommentNode({ comment, replies, isAuthed, currentUserId, targetKind, targetId }: CommentNodeProps) {
  return (
    <li className="space-y-3">
      <CommentRow comment={comment} isOwn={comment.user_id === currentUserId} />
      <div className="ml-12 space-y-3">
        {replies.map((r) => (
          <CommentRow key={r.id} comment={r} isOwn={r.user_id === currentUserId} />
        ))}
        {isAuthed ? (
          <CommentComposer
            targetKind={targetKind}
            targetId={targetId}
            parentId={comment.id}
            isAuthed={isAuthed}
            placeholder="Reply…"
            compact
          />
        ) : null}
      </div>
    </li>
  )
}

function CommentRow({
  comment,
  isOwn,
}: {
  comment: Awaited<ReturnType<typeof listCommentsFor>>[number]
  isOwn: boolean
}) {
  return (
    <div className="flex gap-3">
      {comment.author?.username ? (
        <Link href={`/u/${comment.author.username}`} className="shrink-0">
          <Avatar className="size-9">
            <AvatarImage src={comment.author.avatar_url ?? undefined} />
            <AvatarFallback>{(comment.author.full_name ?? "?").slice(0, 2)}</AvatarFallback>
          </Avatar>
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-muted/40 px-4 py-2">
          <Link
            href={`/u/${comment.author?.username}`}
            className="text-sm font-medium hover:underline"
          >
            {comment.author?.full_name ?? `@${comment.author?.username}`}
          </Link>
          <p className="mt-0.5 whitespace-pre-line text-sm">{renderMentions(comment.body)}</p>
        </div>
        <p className="mt-1 px-3 text-xs text-muted-foreground">
          {new Date(comment.created_at).toLocaleString()}
          {isOwn ? " · you" : ""}
        </p>
      </div>
    </div>
  )
}
