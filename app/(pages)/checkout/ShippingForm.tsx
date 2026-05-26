"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export interface ShippingAddress {
  full_name: string
  line1: string
  line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  phone: string | null
}

interface SavedAddress extends ShippingAddress {
  id: string
  is_default: boolean
}

interface ShippingFormProps {
  defaultName: string
  savedAddresses: SavedAddress[]
  saveAddress: boolean
  onSaveAddressChange: (next: boolean) => void
  pending: boolean
  onSubmit: (addr: ShippingAddress) => void
}

export function ShippingForm({
  defaultName,
  savedAddresses,
  saveAddress,
  onSaveAddressChange,
  pending,
  onSubmit,
}: ShippingFormProps) {
  const [selected, setSelected] = useState<SavedAddress | null>(
    savedAddresses[0] ?? null,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping address</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {savedAddresses.length > 0 ? (
          <div className="space-y-2">
            <Label>Saved addresses</Label>
            <div className="grid gap-2 md:grid-cols-2">
              {savedAddresses.map((a) => {
                const active = selected?.id === a.id
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelected(a)}
                    className={
                      active
                        ? "rounded-xl border-2 border-primary bg-primary/10 p-3 text-left text-sm"
                        : "rounded-xl border border-border p-3 text-left text-sm transition-colors hover:bg-muted/40"
                    }
                  >
                    <p className="font-medium">{a.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postal_code}
                    </p>
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className={
                  selected === null
                    ? "rounded-xl border-2 border-dashed border-primary bg-primary/10 p-3 text-center text-sm text-primary"
                    : "rounded-xl border border-dashed border-border p-3 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/40"
                }
              >
                + Add a new address
              </button>
            </div>
          </div>
        ) : null}

        <form
          className="space-y-4"
          action={(fd) => {
            const addr: ShippingAddress = selected ?? {
              full_name: String(fd.get("full_name") ?? ""),
              line1: String(fd.get("line1") ?? ""),
              line2: String(fd.get("line2") ?? "") || null,
              city: String(fd.get("city") ?? ""),
              state: String(fd.get("state") ?? ""),
              postal_code: String(fd.get("postal_code") ?? ""),
              country: String(fd.get("country") ?? "IN"),
              phone: String(fd.get("phone") ?? "") || null,
            }
            onSubmit(addr)
          }}
        >
          {!selected && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Full name" name="full_name" defaultValue={defaultName} required />
                <Field label="Phone" name="phone" type="tel" />
              </div>
              <Field label="Address line 1" name="line1" required />
              <Field label="Address line 2" name="line2" />
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="City" name="city" required />
                <Field label="State" name="state" required />
                <Field label="Postal code" name="postal_code" required />
              </div>
              <Field label="Country" name="country" defaultValue="IN" required />

              <div className="flex items-center gap-3">
                <Switch
                  id="saveAddress"
                  checked={saveAddress}
                  onCheckedChange={onSaveAddressChange}
                />
                <Label htmlFor="saveAddress" className="text-sm">
                  Save this address for next time
                </Label>
              </div>
            </>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Preparing checkout…" : "Continue to payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  defaultValue?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} defaultValue={defaultValue} />
    </div>
  )
}
