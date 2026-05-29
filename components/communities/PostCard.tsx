"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { Heart, MessageCircle } from "lucide-react"
import { toast } from "sonner"

import { createPostComment } from "@/lib/data/community-actions"
import { toggleLike } from "@/lib/data/social-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { Textarea } from "@/components/ui/textarea"
import type { CommunityPostRow } from "@/lib/data/communities"
import { renderMentions } from "@/lib/text"

interface PostCardProps {
  post: CommunityPostRow
  isAuthed: boolean
}

export function PostCard({ post, isAuthed }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post.like_count)
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment] = useState("")
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-3">
          {post.author?.username ? (
            <Link href={`/u/${post.author.username}`} className="flex items-center gap-2">
              <Avatar className="size-9">
                <AvatarImage src={post.author.avatar_url ?? undefined} />
                <AvatarFallback>{(post.author.full_name ?? "?").slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {post.author.full_name ?? `@${post.author.username}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
            </Link>
          ) : null}
        </div>

        {post.title ? <h3 className="font-display text-lg">{post.title}</h3> : null}
        {post.body ? (
          <p className="whitespace-pre-line text-sm">{renderMentions(post.body)}</p>
        ) : null}

        {Array.isArray(post.media) && post.media.length ? (
          <div className={`grid gap-2 ${(post.media as unknown[]).length > 1 ? "grid-cols-2" : ""}`}>
            {(post.media as Array<{ url: string; kind: "image" | "video" }>).map((m, i) => (
              <div key={i} className="relative aspect-video overflow-hidden rounded-lg">
                {m.kind === "video" ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={m.url} controls className="size-full object-cover" />
                ) : (
                  <SmartImage
                    src={m.url}
                    alt={post.title ?? "Community post media"}
                    kind="community"
                    seed={post.title ?? post.id}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-2 border-t border-border pt-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            className={liked ? "text-rose-400" : ""}
            onClick={() => {
              if (!isAuthed) return
              setLiked((v) => !v)
              setLikes((c) => c + (liked ? -1 : 1))
              startTransition(async () => {
                const r = await toggleLike("post", post.id)
                if (!r.ok) {
                  setLiked((v) => !v)
                  setLikes((c) => c + (liked ? 1 : -1))
                }
              })
            }}
          >
            <Heart className={liked ? "size-4 fill-current" : "size-4"} />
            {likes > 0 ? <span className="tabular-nums">{likes}</span> : null}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComment((v) => !v)}
          >
            <MessageCircle className="size-4" />
            {post.comment_count > 0 ? (
              <span className="tabular-nums">{post.comment_count}</span>
            ) : null}
          </Button>
        </div>

        {showComment ? (
          <form
            action={() =>
              startTransition(async () => {
                const r = await createPostComment(post.id, comment)
                if (r.ok) {
                  toast.success("Reply added.")
                  setComment("")
                  setShowComment(false)
                } else {
                  toast.error(r.error)
                }
              })
            }
            className="space-y-2"
          >
            <Textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a reply…"
              maxLength={500}
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={pending || !comment.trim()}>
                {pending ? "Replying…" : "Reply"}
              </Button>
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  )
}
