"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { createAdmin, deleteAdmin, revokeAdmin } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CreateAdminForm() {
  const [role, setRole] = useState("admin")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create admin</CardTitle>
        <CardDescription>Issue credentials for a new admin or super-admin account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={(fd) =>
            startTransition(async () => {
              setError(null)
              fd.set("role", role)
              const r = await createAdmin(fd)
              if (r.ok) {
                toast.success("Admin account created.")
                ;(document.getElementById("create-admin-form") as HTMLFormElement | null)?.reset()
              } else setError(r.error)
            })
          }
          id="create-admin-form"
          className="grid max-w-2xl gap-4 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" placeholder="Jane Admin" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="admin@dwellika.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Temporary password</Label>
            <Input id="password" name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create admin"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function AdminRowActions({ userId, isSelf }: { userId: string; isSelf: boolean }) {
  const [pending, startTransition] = useTransition()

  if (isSelf) {
    return <span className="text-xs text-muted-foreground">You</span>
  }

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const r = await revokeAdmin(userId)
            if (r.ok) toast.success("Privileges revoked")
            else toast.error(r.error)
          })
        }
      >
        Revoke
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() => {
          if (!confirm("Permanently delete this admin account? This cannot be undone.")) return
          startTransition(async () => {
            const r = await deleteAdmin(userId)
            if (r.ok) toast.success("Admin deleted")
            else toast.error(r.error)
          })
        }}
      >
        Delete
      </Button>
    </div>
  )
}
