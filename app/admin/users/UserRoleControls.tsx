"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { setUserRole } from "./actions"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AppRole } from "@/lib/types/database"

const ROLES: AppRole[] = ["user", "artist", "seller", "admin", "super_admin"]

export function UserRoleControls({
  userId,
  currentRole,
  viewerRole,
}: {
  userId: string
  currentRole: AppRole
  viewerRole: AppRole
}) {
  const [pending, startTransition] = useTransition()
  const canPromote = viewerRole === "super_admin"

  return (
    <div className="flex items-center gap-2">
      {canPromote ? (
        <Select
          value={currentRole}
          onValueChange={(v) =>
            startTransition(async () => {
              const r = await setUserRole(userId, v as AppRole)
              if (r.ok) toast.success("Role updated")
              else toast.error(r.error)
            })
          }
          disabled={pending}
        >
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Badge variant="outline" className="capitalize">{currentRole.replace("_", " ")}</Badge>
      )}
    </div>
  )
}
