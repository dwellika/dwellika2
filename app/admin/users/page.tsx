import Link from "next/link"
import { Search } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { requireRole } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { UserRoleControls } from "./UserRoleControls"

export const metadata = { title: "Admin · Users" }

interface PageProps {
  searchParams: Promise<{ q?: string; tab?: "all" | "artists" | "sellers" | "users" }>
}

type RoleFilter = "all" | "artists" | "sellers" | "users"

const ROLE_MAP: Record<RoleFilter, string | undefined> = {
  all:     undefined,
  artists: "artist",
  sellers: "seller",
  users:   "user",
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const viewer = await requireRole("admin", "super_admin")
  const { q, tab = "all" } = await searchParams

  const roleFilter = ROLE_MAP[tab as RoleFilter]

  const [rows, counts] = await Promise.all([
    prisma.user.findMany({
      where: {
        ...(roleFilter ? { role: roleFilter as "artist" | "seller" | "user" } : {}),
        ...(q
          ? {
              OR: [
                { username:  { contains: q, mode: "insensitive" } },
                { full_name: { contains: q, mode: "insensitive" } },
                { email:     { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id:              true,
        username:        true,
        full_name:       true,
        avatar_url:      true,
        email:           true,
        role:            true,
        is_verified:     true,
        suspended_until: true,
        created_at:      true,
        location:        true,
      },
      orderBy: { created_at: "desc" },
      take:    80,
    }),
    prisma.user.groupBy({
      by:    ["role"],
      _count: { _all: true },
    }),
  ])

  const countMap = Object.fromEntries(counts.map((c) => [c.role, c._count._all]))

  const TABS: Array<{ key: RoleFilter; label: string }> = [
    { key: "all",     label: `All (${Object.values(countMap).reduce((a, b) => a + b, 0)})` },
    { key: "artists", label: `Artists (${countMap.artist ?? 0})`  },
    { key: "sellers", label: `Sellers (${countMap.seller ?? 0})`  },
    { key: "users",   label: `Users (${countMap.user ?? 0})`      },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Users</h1>
        <p className="mt-1 text-muted-foreground">
          Manage roles, suspend, ban, or delete users. Super-admins can change roles and delete accounts.
        </p>
      </header>

      {/* Search */}
      <form className="max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by name, username, or email…"
            className="pl-9"
          />
          {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
        </div>
      </form>

      {/* Role tabs */}
      <Tabs defaultValue={tab} className="space-y-4">
        <TabsList>
          {TABS.map(({ key, label }) => (
            <TabsTrigger key={key} value={key} asChild>
              <Link href={`/admin/users?tab=${key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>
                {label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab}>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {rows.length === 0 ? (
                <p className="px-4 py-12 text-center text-sm text-muted-foreground">No users found.</p>
              ) : null}
              {rows.map((u) => {
                const isSuspended = u.suspended_until != null && new Date(u.suspended_until) > new Date()
                return (
                  <div key={u.id} className="flex flex-col gap-3 p-3 md:flex-row md:items-start">
                    {/* Avatar + name */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar className="size-9 shrink-0">
                        <AvatarFallback>{(u.full_name ?? u.username ?? "?").slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/u/${u.username}`}
                            className="text-sm font-medium hover:underline"
                          >
                            {u.full_name ?? `@${u.username}`}
                          </Link>
                          {u.is_verified && (
                            <Badge variant="outline" className="text-[10px]">Verified</Badge>
                          )}
                          {isSuspended && (
                            <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          @{u.username} · {u.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {u.location ? `${u.location} · ` : ""}
                          Joined {new Date(u.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex-shrink-0 md:w-64">
                      <UserRoleControls
                        userId={u.id}
                        currentRole={u.role as "super_admin" | "admin" | "artist" | "seller" | "user"}
                        viewerRole={viewer.role}
                        suspendedUntil={u.suspended_until?.toISOString() ?? null}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
