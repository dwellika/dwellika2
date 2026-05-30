"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { banUser, deleteUser, setUserRole, suspendUser, unsuspendUser } from "./actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AppRole } from "@/lib/types/database"

const ROLES: AppRole[] = ["user", "artist", "seller", "admin", "super_admin"]

const SUSPEND_OPTIONS = [
  { label: "1 day",    days: 1   },
  { label: "7 days",   days: 7   },
  { label: "30 days",  days: 30  },
  { label: "Permanent", days: 0  },
]

interface Props {
  userId:          string
  currentRole:     AppRole
  viewerRole:      AppRole
  suspendedUntil:  string | null  // ISO or null
}

export function UserRoleControls({ userId, currentRole, viewerRole, suspendedUntil }: Props) {
  const [pending, startTransition] = useTransition()
  const [reason, setReason]   = useState("")
  const [suspendDays, setSuspendDays] = useState<number>(7)
  const [showActions, setShowActions] = useState(false)

  const isSuperAdmin  = viewerRole === "super_admin"
  const isAdmin       = viewerRole === "admin" || isSuperAdmin
  const isSuspended   = suspendedUntil != null && new Date(suspendedUntil) > new Date()
  const isPermanent   = suspendedUntil === "9999-12-30T18:30:00.000Z" || suspendedUntil === "9999-12-31T00:00:00.000Z"

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Role selector — super_admin only */}
        {isSuperAdmin ? (
          <Select
            value={currentRole}
            disabled={pending}
            onValueChange={(v) =>
              startTransition(async () => {
                const r = await setUserRole(userId, v as AppRole)
                if (r.ok) toast.success("Role updated")
                else toast.error(r.error)
              })
            }
          >
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r} className="text-xs">
                  {r.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="outline" className="capitalize">{currentRole.replace("_", " ")}</Badge>
        )}

        {/* Suspension badge */}
        {isSuspended && (
          <Badge variant="destructive" className="text-[10px]">
            {isPermanent ? "Permanent ban" : `Suspended until ${new Date(suspendedUntil!).toLocaleDateString()}`}
          </Badge>
        )}

        {/* Toggle action drawer */}
        {isAdmin && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => setShowActions((p) => !p)}
          >
            {showActions ? "Hide" : "Actions"}
          </Button>
        )}
      </div>

      {/* Expanded action drawer */}
      {showActions && isAdmin && (
        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
          <Input
            placeholder="Reason (required for all actions)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-7 text-xs"
          />

          <div className="flex flex-wrap gap-1.5">
            {/* Suspend */}
            {!isSuspended && (
              <>
                <Select value={String(suspendDays)} onValueChange={(v) => setSuspendDays(Number(v))}>
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUSPEND_OPTIONS.map((o) => (
                      <SelectItem key={o.days} value={String(o.days)} className="text-xs">
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  disabled={pending || !reason.trim()}
                  onClick={() =>
                    startTransition(async () => {
                      const r = await suspendUser(userId, suspendDays, reason)
                      if (r.ok) { toast.success("User suspended"); setShowActions(false) }
                      else toast.error(r.error)
                    })
                  }
                >
                  Suspend
                </Button>
              </>
            )}

            {/* Unsuspend */}
            {isSuspended && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const r = await unsuspendUser(userId)
                    if (r.ok) { toast.success("User unsuspended"); setShowActions(false) }
                    else toast.error(r.error)
                  })
                }
              >
                Unsuspend
              </Button>
            )}

            {/* Ban */}
            <Button
              size="sm"
              variant="destructive"
              className="h-7 text-xs"
              disabled={pending || !reason.trim()}
              onClick={() =>
                startTransition(async () => {
                  const r = await banUser(userId, reason)
                  if (r.ok) { toast.success("User banned"); setShowActions(false) }
                  else toast.error(r.error)
                })
              }
            >
              Ban
            </Button>

            {/* Hard delete — super_admin only */}
            {isSuperAdmin && (
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs"
                disabled={pending || !reason.trim()}
                onClick={() => {
                  if (!confirm("Permanently delete this user and ALL their content? This cannot be undone.")) return
                  startTransition(async () => {
                    const r = await deleteUser(userId, reason)
                    if (r.ok) toast.success("User deleted")
                    else toast.error(r.error)
                  })
                }}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
