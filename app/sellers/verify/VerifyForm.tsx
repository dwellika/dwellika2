"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, FileText, Upload } from "lucide-react"
import { toast } from "sonner"

import { submitVerification } from "./actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type DocKind = "pan" | "aadhaar" | "gst" | "address_proof" | "bank_details"

interface VerifyFormProps {
  defaults: {
    business_name: string
    legal_name: string
    gst_number: string
    pan_number: string
    address: {
      line1: string
      line2: string
      city: string
      state: string
      postal_code: string
      country: string
    }
    bank: {
      account_holder: string
      account_number: string
      ifsc: string
    }
  }
  docsState: Array<{
    id: string
    doc_kind: string
    status: string
    notes: string | null
    created_at: string
    reviewed_at: string | null
  }>
}

const DOC_META: Array<{ id: DocKind; label: string; required: boolean }> = [
  { id: "pan", label: "PAN card", required: true },
  { id: "aadhaar", label: "Aadhaar (front + back)", required: true },
  { id: "address_proof", label: "Address proof", required: true },
  { id: "gst", label: "GST certificate", required: false },
  { id: "bank_details", label: "Bank statement / cancelled cheque", required: false },
]

const STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300",
  approved: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-red-500/20 text-red-300",
  resubmit: "bg-orange-500/20 text-orange-300",
}

export function VerifyForm({ defaults, docsState }: VerifyFormProps) {
  const [files, setFiles] = useState<Partial<Record<DocKind, File>>>({})
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          for (const [kind, file] of Object.entries(files)) {
            if (file) fd.set(`doc_${kind}`, file)
          }
          const r = await submitVerification(fd)
          if (r && !r.ok) toast.error(r.error)
        })
      }
      className="space-y-6"
    >
      <section className="space-y-4">
        <h3 className="font-medium">Business details</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Field name="business_name" label="Business name" required defaultValue={defaults.business_name} />
          <Field name="legal_name" label="Legal entity name" defaultValue={defaults.legal_name} />
          <Field name="pan_number" label="PAN number" defaultValue={defaults.pan_number} />
          <Field name="gst_number" label="GST number (optional)" defaultValue={defaults.gst_number} />
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h3 className="font-medium">Registered address</h3>
        <div className="grid gap-3">
          <Field name="addr_line1" label="Address line 1" required defaultValue={defaults.address.line1} />
          <Field name="addr_line2" label="Address line 2" defaultValue={defaults.address.line2} />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Field name="addr_city" label="City" required defaultValue={defaults.address.city} />
          <Field name="addr_state" label="State" required defaultValue={defaults.address.state} />
          <Field name="addr_postal" label="Postal code" required defaultValue={defaults.address.postal_code} />
        </div>
        <Field name="addr_country" label="Country" defaultValue={defaults.address.country || "IN"} />
      </section>

      <Separator />

      <section className="space-y-4">
        <h3 className="font-medium">Bank details (optional)</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <Field name="bank_holder" label="Account holder" defaultValue={defaults.bank.account_holder} />
          <Field name="bank_account" label="Account number" defaultValue={defaults.bank.account_number} />
          <Field name="bank_ifsc" label="IFSC" defaultValue={defaults.bank.ifsc} />
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="font-medium">Documents</h3>
        <div className="grid gap-3">
          {DOC_META.map((d) => {
            const existing = docsState.find((x) => x.doc_kind === d.id)
            const file = files[d.id]
            return (
              <div
                key={d.id}
                className="flex flex-col gap-2 rounded-xl border border-border p-3 md:flex-row md:items-center"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="font-medium">{d.label}</span>
                    {d.required ? <Badge variant="outline">Required</Badge> : null}
                    {existing ? (
                      <Badge className={STATUS_TONE[existing.status] ?? ""}>
                        {existing.status}
                      </Badge>
                    ) : null}
                  </div>
                  {file ? (
                    <p className="mt-1 text-xs text-muted-foreground">{file.name}</p>
                  ) : existing ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last submitted {new Date(existing.created_at).toLocaleDateString()}
                      {existing.notes ? ` — ${existing.notes}` : ""}
                    </p>
                  ) : null}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-1 self-end rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted/40 md:self-center">
                  {existing && !file ? (
                    <>
                      <CheckCircle2 className="size-3.5 text-emerald-400" /> Re-upload
                    </>
                  ) : (
                    <>
                      <Upload className="size-3.5" /> Upload
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) setFiles((prev) => ({ ...prev, [d.id]: f }))
                    }}
                  />
                </label>
              </div>
            )
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Submitting…" : "Submit for verification"}
        </Button>
      </div>
    </form>
  )
}

function Field({
  name,
  label,
  required,
  defaultValue,
}: {
  name: string
  label: string
  required?: boolean
  defaultValue?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required={required} defaultValue={defaultValue} />
    </div>
  )
}
