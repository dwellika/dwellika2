import { notFound, redirect } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAuth } from "@/lib/auth/rbac"
import { createClient } from "@/lib/supabase/server"

import { NewDisputeForm } from "./NewDisputeForm"

export const metadata = { title: "Open a dispute" }

interface PageProps {
  searchParams: Promise<{ order?: string }>
}

export default async function NewDisputePage({ searchParams }: PageProps) {
  const { order: orderId } = await searchParams
  if (!orderId) notFound()

  const user = await requireAuth()
  const supabase = await createClient()
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, total, currency, status, buyer_id")
    .eq("id", orderId)
    .maybeSingle()
  const o = order as
    | {
        id: string
        order_number: string
        total: number
        currency: string
        status: string
        buyer_id: string
      }
    | null
  if (!o) notFound()
  if (o.buyer_id !== user.id) redirect("/403")

  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Dispute</p>
        <h1 className="font-display text-4xl">Open a dispute</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Tell us what happened with order <strong>{o.order_number}</strong>. Our team
          will review the case with the seller and resolve it within 5 business days.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <NewDisputeForm orderId={o.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">{o.order_number}</p>
            <p className="text-muted-foreground capitalize">Status: {o.status}</p>
            <p className="text-muted-foreground">
              Total: {o.currency} {Number(o.total).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
