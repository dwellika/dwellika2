"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, FileText, Loader2, Upload } from "lucide-react"
import { toast } from "sonner"

import { submitVerification } from "./actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type DocKind = "pan" | "aadhaar" | "gst" | "address_proof" | "bank_details"

interface Defaults {
  full_name:     string
  email:         string
  username:      string
  mobile:        string
  business_name: string
  legal_name:    string
  gst_number:    string
  pan_number:    string
  website:       string
  socials:       { instagram: string; twitter: string; facebook: string; youtube: string; linkedin: string }
  address:       { line1: string; line2: string; city: string; state: string; postal_code: string; country: string }
  shop_address:  { line1: string; line2: string; city: string; state: string; postal_code: string; country: string }
  bank:          { account_holder: string; account_number: string; ifsc: string }
}

interface VerifyFormProps {
  defaults: Defaults
  docsState: Array<{
    id: string; doc_kind: string; status: string; notes: string | null; created_at: string; reviewed_at: string | null
  }>
}

const DOC_META: Array<{ id: DocKind; label: string; required: boolean }> = [
  { id: "pan",           label: "PAN card",                           required: true  },
  { id: "aadhaar",       label: "Aadhaar (front + back)",            required: true  },
  { id: "address_proof", label: "Address proof",                     required: true  },
  { id: "gst",           label: "GST certificate",                   required: false },
  { id: "bank_details",  label: "Bank statement / cancelled cheque", required: false },
]

const STATUS_TONE: Record<string, string> = {
  pending:  "bg-amber-500/20 text-amber-300",
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
      {/* ── Auto-filled identity ── */}
      <section className="space-y-4">
        <h3 className="font-semibold">Identity (auto-filled)</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="full_name_display" label="Full name" defaultValue={defaults.full_name} disabled />
          <Field name="email_display"     label="Email"     defaultValue={defaults.email}     disabled />
          <Field name="username_display"  label="Username"  defaultValue={defaults.username}  disabled />
          <div className="space-y-1.5">
            <Label htmlFor="mobile">Mobile number</Label>
            <Input id="mobile" name="mobile" defaultValue={defaults.mobile} placeholder="+91 98765 43210" />
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Business details ── */}
      <section className="space-y-4">
        <h3 className="font-semibold">Business details</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="business_name" label="Shop / business name" required defaultValue={defaults.business_name} />
          <Field name="legal_name"    label="Legal entity name"           defaultValue={defaults.legal_name}    />
          <Field name="pan_number"    label="PAN number"                  defaultValue={defaults.pan_number}    />
          <Field name="gst_number"    label="GSTN (optional)"             defaultValue={defaults.gst_number}    />
          <Field name="website"       label="Website"                     defaultValue={defaults.website}       placeholder="https://yourshop.com" />
        </div>
      </section>

      <Separator />

      {/* ── Social links ── */}
      <section className="space-y-4">
        <h3 className="font-semibold">Social links</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="social_instagram" label="Instagram" defaultValue={defaults.socials.instagram} placeholder="https://instagram.com/yourshop" />
          <Field name="social_twitter"   label="Twitter / X" defaultValue={defaults.socials.twitter}  placeholder="https://x.com/yourshop" />
          <Field name="social_facebook"  label="Facebook"    defaultValue={defaults.socials.facebook}  placeholder="https://facebook.com/yourshop" />
          <Field name="social_youtube"   label="YouTube"     defaultValue={defaults.socials.youtube}   placeholder="https://youtube.com/@yourshop" />
          <Field name="social_linkedin"  label="LinkedIn"    defaultValue={defaults.socials.linkedin}  placeholder="https://linkedin.com/company/yourshop" />
        </div>
      </section>

      <Separator />

      {/* ── Registered address ── */}
      <section className="space-y-4">
        <h3 className="font-semibold">Registered address</h3>
        <Field name="addr_line1"  label="Address line 1" required defaultValue={defaults.address.line1}       />
        <Field name="addr_line2"  label="Address line 2"          defaultValue={defaults.address.line2}       />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field name="addr_city"   label="City"        required defaultValue={defaults.address.city}        />
          <Field name="addr_state"  label="State"       required defaultValue={defaults.address.state}       />
          <Field name="addr_postal" label="Postal code" required defaultValue={defaults.address.postal_code} />
        </div>
        <input type="hidden" name="addr_country" defaultValue={defaults.address.country || "IN"} />
      </section>

      <Separator />

      {/* ── Shop address ── */}
      <section className="space-y-4">
        <h3 className="font-semibold">
          Shop address{" "}
          <span className="text-xs font-normal text-muted-foreground">(if different from registered)</span>
        </h3>
        <Field name="shop_addr_line1"  label="Shop address line 1" defaultValue={defaults.shop_address.line1}       />
        <Field name="shop_addr_line2"  label="Shop address line 2" defaultValue={defaults.shop_address.line2}       />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field name="shop_addr_city"   label="City"        defaultValue={defaults.shop_address.city}        />
          <Field name="shop_addr_state"  label="State"       defaultValue={defaults.shop_address.state}       />
          <Field name="shop_addr_postal" label="Postal code" defaultValue={defaults.shop_address.postal_code} />
        </div>
        <input type="hidden" name="shop_addr_country" defaultValue={defaults.shop_address.country || "IN"} />
      </section>

      <Separator />

      {/* ── Bank details ── */}
      <section className="space-y-4">
        <h3 className="font-semibold">Bank details</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field name="bank_holder"  label="Account holder" defaultValue={defaults.bank.account_holder} />
          <Field name="bank_account" label="Account number" defaultValue={defaults.bank.account_number} />
          <Field name="bank_ifsc"    label="IFSC code"      defaultValue={defaults.bank.ifsc}           />
        </div>
      </section>

      <Separator />

      {/* ── KYC documents ── */}
      <section className="space-y-3">
        <h3 className="font-semibold">KYC documents</h3>
        <div className="space-y-2">
          {DOC_META.map((d) => {
            const existing = docsState.find((x) => x.doc_kind === d.id)
            const file = files[d.id]
            return (
              <div
                key={d.id}
                className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{d.label}</span>
                    {d.required && <Badge variant="outline" className="text-[10px]">Required</Badge>}
                    {existing && (
                      <Badge className={`text-[10px] ${STATUS_TONE[existing.status] ?? ""}`}>
                        {existing.status}
                      </Badge>
                    )}
                  </div>
                  {file ? (
                    <p className="mt-1 text-xs text-muted-foreground">{file.name}</p>
                  ) : existing ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(existing.created_at).toLocaleDateString()}
                      {existing.notes ? ` · ${existing.notes}` : ""}
                    </p>
                  ) : null}
                </div>
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
              </div>
            )
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? "Submitting…" : "Submit for verification"}
        </Button>
      </div>
    </form>
  )
}

function Field({
  name, label, required, defaultValue, placeholder, disabled,
}: {
  name: string; label: string; required?: boolean; defaultValue?: string; placeholder?: string; disabled?: boolean
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
