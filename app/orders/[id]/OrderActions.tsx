"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { MessageSquare, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

import { getOrCreateOrderChat } from "@/lib/data/chat-actions"
import { Button } from "@/components/ui/button"

export function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const openChat = () =>
    startTransition(async () => {
      const result = await getOrCreateOrderChat(orderId)
      if (result.ok && result.data) {
        router.push(`/messages/${result.data.chatId}`)
      } else if (!result.ok) {
        toast.error(result.error)
      }
    })

  const showDispute = status === "delivered" || status === "shipped" || status === "processing"

  return (
    <>
      <Button variant="outline" size="sm" disabled={pending} onClick={openChat}>
        <MessageSquare className="size-4" /> Message
      </Button>
      {showDispute ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/disputes/new?order=${orderId}`)}
        >
          <ShieldAlert className="size-4" /> Open dispute
        </Button>
      ) : null}
    </>
  )
}
