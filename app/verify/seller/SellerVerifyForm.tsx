"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, FileText, Loader2, Save, Upload } from "lucide-react"
import { toast } from "sonner"

import { saveSellerDraft, submitSellerVerification } from "./actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type DocKind = "pan" | "aadhaar" | "gst" | "address_proof" | "other"

interface Doc {
  id: string
  doc_kind: string
  status: string
  notes: string | null
  created_at: string
}

interface Defaults {
  full_name: string
  email: string
  username: string
  mobile: string
  business_name: string
  legal_name: string
  gst_number: string
  pan_number: string
  website: string
  socials: Record<string, string>
  address: { line1: string; line2: string; city: string; state: string; postal_code: string; country: string }
  shop_address: { line1: string; line2: string; city: string; state: string; postal_code: string; country: string }
  bank: { account_holder: string; account_number: string; ifsc: string; bank_name: string }
}

interface SellerVerifyFormProps {
  defaults: Defaults
  docs: Doc[]
  status: string
}

const DOC_META: Array<{ id: DocKind; label: string; required: boolean }> = [
  { id: "pan", label: "PAN card", required: true },
  { id: "aadhaar", label: "Aadhaar (front + back)", required: false },
  { id: "gst", label: "GST certificate", required: false },
  { id: "address_proof", label: "Shop / address proof", required: false },
  { id: "other", label: "Any other supporting document", required: false },
]

const STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300",
  approved: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-red-500/20 text-red-300",
  resubmit: "bg-orange-500/20 text-orange-300",
}

const VERIF_STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-500/20 text-blue-300",
  under_review: "bg-amber-500/20 text-amber-300",
  approved: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-red-500/20 text-red-300",
  resubmit_requested: "bg-orange-500/20 text-orange-300",
}

export function SellerVerifyForm({ defaults, docs, status }: SellerVerifyFormProps) {
  const [files, setFiles] = useState<Partial<Record<DocKind, File>>>({})
  const [submitting, startSubmit] = useTransition()
  const [saving, startSave] = useTransition()

  const isLocked = status === "submitted" || status === "under_review" || status === "approved"

  function buildFormData(fd: FormData) {
    for (const [kind, file] of Object.entries(files)) {
      if (file) fd.set(`doc_${kind}`, file)
    }
    return fd
  }

  return (
    <form className="space-y-8">
      {status !== "draft" && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${VERIF_STATUS_TONE[status] ?? ""}`}>
          <span className="font-medium capitalize">{status.replace("_", " ")}</span>
          {status === "submitted" && " — Our team will review within 1-3 business days."}
          {status === "under_review" && " — Your application is being reviewed."}
          {status === "approved" && " — Congratulations! You are now a verified seller."}
          {status === "rejected" && " — See admin notes below. Resubmit when ready."}
          {status === "resubmit_requested" && " — Please resubmit the requested documents."}
        </div>
      )}

      {/* Personal info */}
      <section className="space-y-4">
        <h3 className="font-semibold">Personal information</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="full_name" label="Full name" defaultValue={defaults.full_name} disabled />
          <Field name="email" label="Email" defaultValue={defaults.email} disabled />
          <Field name="username" label="Username" defaultValue={defaults.username} disabled />
          <div className="space-y-1.5">
            <Label htmlFor="mobile">Mobile number <span className="text-xs text-muted-foreground">(OTP verification coming soon)</span></Label>
            <Input id="mobile" name="mobile" defaultValue={defaults.mobile} placeholder="+91 98765 43210" disabled={isLocked} />
          </div>
        </div>
      </section>

      <Separator />

      {/* Shop details */}
      <section className="space-y-4">
        <h3 className="font-semibold">Shop details</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="business_name" label="Shop / business name" placeholder="Raj Art Supplies" defaultValue={defaults.business_name} disabled={isLocked} />
          <Field name="legal_name" label="Legal / registered name (optional)" defaultValue={defaults.legal_name} disabled={isLocked} />
          <Field name="gst_number" label="GSTIN" placeholder="22AAAAA0000A1Z5" defaultValue={defaults.gst_number} disabled={isLocked} />
          <Field name="pan_number" label="PAN" placeholder="ABCDE1234F" defaultValue={defaults.pan_number} disabled={isLocked} />
          <Field name="website" label="Website (optional)" placeholder="https://yourshop.com" defaultValue={defaults.website} disabled={isLocked} />
        </div>
      </section>

      <Separator />

      {/* Contact address */}
      <section className="space-y-4">
        <h3 className="font-semibold">Contact address</h3>
        <Field name="addr_line1" label="Line 1" required defaultValue={defaults.address.line1} disabled={isLocked} />
        <Field name="addr_line2" label="Line 2 (optional)" defaultValue={defaults.address.line2} disabled={isLocked} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field name="addr_city" label="City" required defaultValue={defaults.address.city} disabled={isLocked} />
          <Field name="addr_state" label="State" required defaultValue={defaults.address.state} disabled={isLocked} />
          <Field name="addr_postal" label="Postal code" required defaultValue={defaults.address.postal_code} disabled={isLocked} />
        </div>
        <input type="hidden" name="addr_country" defaultValue={defaults.address.country || "IN"} />
      </section>

      <Separator />

      {/* Shop address */}
      <section className="space-y-4">
        <h3 className="font-semibold">Shop address <span className="text-xs font-normal text-muted-foreground">(if different from contact address)</span></h3>
        <Field name="shop_line1" label="Line 1" defaultValue={defaults.shop_address.line1} disabled={isLocked} />
        <Field name="shop_line2" label="Line 2 (optional)" defaultValue={defaults.shop_address.line2} disabled={isLocked} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field name="shop_city" label="City" defaultValue={defaults.shop_address.city} disabled={isLocked} />
          <Field name="shop_state" label="State" defaultValue={defaults.shop_address.state} disabled={isLocked} />
          <Field name="shop_postal" label="Postal code" defaultValue={defaults.shop_address.postal_code} disabled={isLocked} />
        </div>
        <input type="hidden" name="shop_country" defaultValue={defaults.shop_address.country || "IN"} />
      </section>

      <Separator />

      {/* Social links */}
      <section className="space-y-4">
        <h3 className="font-semibold">Social handles</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="instagram_url" label="Instagram URL" placeholder="https://instagram.com/you" defaultValue={defaults.socials.instagram ?? ""} disabled={isLocked} />
          <Field name="pinterest_url" label="Pinterest URL" placeholder="https://pinterest.com/you" defaultValue={defaults.socials.pinterest ?? ""} disabled={isLocked} />
          <Field name="facebook_url" label="Facebook URL" placeholder="https://facebook.com/you" defaultValue={defaults.socials.facebook ?? ""} disabled={isLocked} />
          <Field name="twitter_url" label="Twitter / X URL" placeholder="https://x.com/you" defaultValue={defaults.socials.twitter ?? ""} disabled={isLocked} />
          <Field name="youtube_url" label="YouTube URL" placeholder="https://youtube.com/@you" defaultValue={defaults.socials.youtube ?? ""} disabled={isLocked} />
        </div>
      </section>

      <Separator />

      {/* Bank details */}
      <section className="space-y-4">
        <h3 className="font-semibold">Bank details <span className="text-xs font-normal text-muted-foreground">(for payouts)</span></h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="bank_holder" label="Account holder name" defaultValue={defaults.bank.account_holder} disabled={isLocked} />
          <Field name="bank_account" label="Account number" defaultValue={defaults.bank.account_number} disabled={isLocked} />
          <Field name="bank_ifsc" label="IFSC code" defaultValue={defaults.bank.ifsc} disabled={isLocked} />
          <Field name="bank_name" label="Bank name" defaultValue={defaults.bank.bank_name} disabled={isLocked} />
        </div>
      </section>

      <Separator />

      {/* KYC documents */}
      <section className="space-y-3">
        <h3 className="font-semibold">KYC documents</h3>
        <div className="space-y-2">
          {DOC_META.map((d) => {
            const existing = docs.find((x) => x.doc_kind === d.id)
            const file = files[d.id]
            return (
              <div key={d.id} className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{d.label}</span>
                    {d.required && <Badge variant="outline" className="text-[10px]">Required</Badge>}
                    {existing && (
                      <Badge className={`text-[10px] ${STATUS_TONE[existing.status] ?? ""}`}>{existing.status}</Badge>
                    )}
                  </div>
                  {file ? (
                    <p className="mt-1 text-xs text-muted-foreground">{file.name}</p>
                  ) : existing ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Uploaded {new Date(existing.created_at).toLocaleDateString()}
                      {existing.notes ? ` · ${existing.notes}` : ""}
                    </p>
                  ) : null}
                </div>
                {!isLocked && (
                  <label className="inline-flex cursor-pointer items-center gap-1.5 self-end rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted/40 sm:self-center">
                    {existing && !file ? (
                      <><CheckCircle2 className="size-3.5 text-emerald-400" /> Re-upload</>
                    ) : (
                      <><Upload className="size-3.5" /> Upload</>
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
                )}
              </div>
            )
          })}
        </div>
      </section>

      {!isLocked && (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={(e) => {
              const fd = buildFormData(new FormData(e.currentTarget.closest("form")!))
              startSave(async () => {
                const r = await saveSellerDraft(fd)
                if (r.ok) toast.success("Draft saved")
                else toast.error(r.error)
              })
            }}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save draft
          </Button>

          <Button
            type="button"
            disabled={submitting}
            onClick={(e) => {
              const fd = buildFormData(new FormData(e.currentTarget.closest("form")!))
              startSubmit(async () => {
                const r = await submitSellerVerification(fd)
                if (r && !r.ok) toast.error(r.error)
              })
            }}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Submit for verification
          </Button>
        </div>
      )}
    </form>
  )
}

function Field({
  name,
  label,
  required,
  defaultValue,
  placeholder,
  disabled,
}: {
  name: string
  label: string
  required?: boolean
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        className={disabled ? "opacity-60" : ""}
      />
    </div>
  )
}
