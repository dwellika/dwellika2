import { Search } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { requireRole } from "@/lib/auth/rbac"
import { createAdminClient } from "@/lib/supabase/admin"

import { UserRoleControls } from "./UserRoleControls"

export const metadata = { title: "Admin · Users" }

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const viewer = await requireRole("admin", "super_admin")
  const { q } = await searchParams
  const admin = createAdminClient()

  let query = admin
    .from("profiles")
    .select("id, username, full_name, avatar_url, role, is_verified, created_at, location")
    .order("created_at", { ascending: false })
    .limit(60)
  if (q) query = query.or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)

  const { data } = await query
  const rows = (data ?? []) as Array<{
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
    role: string
    is_verified: boolean
    created_at: string
    location: string | null
  }>

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Users</h1>
        <p className="mt-1 text-muted-foreground">
          Promote admins, manage roles, ban abusive users.
        </p>
      </header>

      <form className="max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q ?? ""} placeholder="Search by name or username…" className="pl-9" />
        </div>
      </form>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {rows.map((u) => (
            <div key={u.id} className="grid items-center gap-3 p-3 md:grid-cols-[1fr_120px_140px_200px]">
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={u.avatar_url ?? undefined} />
                  <AvatarFallback>{(u.full_name ?? u.username ?? "?").slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {u.full_name ?? `@${u.username}`}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">@{u.username}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{u.location ?? ""}</p>
              <p className="text-xs text-muted-foreground">
                Joined {new Date(u.created_at).toLocaleDateString()}
              </p>
              <UserRoleControls
                userId={u.id}
                currentRole={u.role as "super_admin" | "admin" | "artist" | "seller" | "user"}
                viewerRole={viewer.role}
              />
            </div>
          ))}
          {rows.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">No users.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
