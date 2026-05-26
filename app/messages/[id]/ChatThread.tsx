"use client"

import Link from "next/link"
import { useEffect, useRef, useState, useTransition } from "react"
import { Paperclip, Send } from "lucide-react"
import { toast } from "sonner"

import { markChatRead, sendMessage } from "@/lib/data/chat-actions"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ChatMessageRow } from "@/lib/data/chat"

interface Participant {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

interface ChatThreadProps {
  chatId: string
  currentUserId: string
  initialMessages: ChatMessageRow[]
  participants: Participant[]
}

export function ChatThread({
  chatId,
  currentUserId,
  initialMessages,
  participants,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<ChatMessageRow[]>(initialMessages)
  const [body, setBody] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [pending, startTransition] = useTransition()
  const [typing, setTyping] = useState<string[]>([])
  const [online, setOnline] = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = useRef(createClient())

  // Auto-scroll to bottom on mount and when messages change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length])

  // Mark read on mount
  useEffect(() => {
    markChatRead(chatId).then(() => {}, () => {})
  }, [chatId])

  // Realtime subscription for new messages + presence
  useEffect(() => {
    const channel = supabase.current
      .channel(`chat:${chatId}`, { config: { presence: { key: currentUserId } } })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const m = payload.new as ChatMessageRow
          setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]))
          if (m.sender_id !== currentUserId) {
            markChatRead(chatId).then(() => {}, () => {})
          }
        },
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        const fromId = (payload.payload as { userId?: string })?.userId
        if (!fromId || fromId === currentUserId) return
        setTyping((prev) => (prev.includes(fromId) ? prev : [...prev, fromId]))
        window.setTimeout(() => {
          setTyping((prev) => prev.filter((id) => id !== fromId))
        }, 3000)
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, unknown>
        setOnline(new Set(Object.keys(state)))
      })

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ user_id: currentUserId, at: Date.now() })
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [chatId, currentUserId])

  const broadcastTyping = () => {
    const ch = supabase.current.channel(`chat:${chatId}`)
    ch.send({ type: "broadcast", event: "typing", payload: { userId: currentUserId } })
  }

  const submit = (formData: FormData) => {
    startTransition(async () => {
      formData.set("chat_id", chatId)
      formData.set("body", body)
      for (const f of attachments) formData.append("attachment", f)
      const result = await sendMessage(formData)
      if (result.ok) {
        setBody("")
        setAttachments([])
      } else {
        toast.error(result.error)
      }
    })
  }

  const otherParticipants = participants.filter((p) => p.id !== currentUserId)
  const typingNames = typing
    .map((id) => participants.find((p) => p.id === id)?.full_name)
    .filter(Boolean)
    .join(", ")

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      {/* Online indicator */}
      {otherParticipants.length > 0 ? (
        <div className="border-b border-border bg-muted/20 px-4 py-1 text-xs text-muted-foreground">
          {otherParticipants
            .map((p) => `${p.full_name ?? `@${p.username}`} ${online.has(p.id) ? "· online" : ""}`)
            .join(" · ")}
        </div>
      ) : null}

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            Say hello to start the conversation.
          </div>
        ) : (
          messages.map((m) => {
            const sender = participants.find((p) => p.id === m.sender_id)
            const isMe = m.sender_id === currentUserId
            return (
              <div key={m.id} className={cn("flex gap-2", isMe ? "justify-end" : "justify-start")}>
                {!isMe ? (
                  <Avatar className="size-7">
                    <AvatarImage src={sender?.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(sender?.full_name ?? sender?.username ?? "?").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                ) : null}
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-3 py-2 text-sm",
                    isMe
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground",
                  )}
                >
                  {m.body ? <p className="whitespace-pre-line">{m.body}</p> : null}
                  {m.attachments?.map((a, i) => (
                    <div key={i} className="mt-2">
                      {a.kind === "image" ? (
                        <SmartImage
                          src={a.url}
                          alt={a.name}
                          kind="generic"
                          seed={a.name}
                          width={320}
                          height={240}
                          className="rounded-lg"
                        />
                      ) : a.kind === "audio" ? (
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <audio src={a.url} controls className="w-full" />
                      ) : (
                        <Link
                          href={a.url}
                          target="_blank"
                          className="inline-flex items-center gap-2 underline"
                        >
                          <Paperclip className="size-3.5" /> {a.name}
                        </Link>
                      )}
                    </div>
                  ))}
                  <p className={cn("mt-1 text-[10px]", isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        {typingNames ? (
          <p className="px-2 text-xs italic text-muted-foreground">{typingNames} is typing…</p>
        ) : null}
      </div>

      <form
        action={submit}
        className="border-t border-border p-3"
      >
        {attachments.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="rounded-full bg-muted px-3 py-1 text-xs"
              >
                {f.name}
                <button
                  type="button"
                  onClick={() => setAttachments((arr) => arr.filter((_, idx) => idx !== i))}
                  className="ml-2 text-muted-foreground"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <label className="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/40">
            <Paperclip className="size-4" />
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,audio/*"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                setAttachments((prev) => [...prev, ...files].slice(0, 4))
              }}
            />
          </label>

          <Textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value)
              broadcastTyping()
            }}
            placeholder="Write a message…"
            rows={1}
            className="min-h-[40px] flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                ;(e.currentTarget.form as HTMLFormElement | null)?.requestSubmit()
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={pending || (!body.trim() && attachments.length === 0)}
            aria-label="Send"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
