import { redirect } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth/rbac"
import { prisma } from "@/lib/prisma"

import { AdminRowActions, CreateAdminForm } from "./AdminControls"

export const metadata = { title: "Admin · Manage admins" }

export default async function ManageAdminsPage() {
  const user = await getCurrentUser()
  // Hard gate — this page is super-admin only (the layout hides the nav link,
  // but the route must enforce it directly too).
  if (!user || user.role !== "super_admin") redirect("/403")

  const admins = await prisma.user
    .findMany({
      where: { role: { in: ["admin", "super_admin"] } },
      select: {
        id: true,
        email: true,
        full_name: true,
        username: true,
        avatar_url: true,
        role: true,
        created_at: true,
      },
      orderBy: { created_at: "asc" },
    })
    .catch(() => [])

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl">Manage admins</h1>
        <p className="mt-1 text-muted-foreground">
          Create and remove admin accounts. Only super admins can access this page.
        </p>
      </header>

      <CreateAdminForm />

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {admins.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No admins found.</p>
            ) : (
              admins.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-4">
                  <Avatar className="size-9">
                    <AvatarImage src={a.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(a.full_name ?? a.email ?? "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {a.full_name ?? a.username ?? a.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{a.email}</p>
                  </div>
                  <Badge variant={a.role === "super_admin" ? "default" : "outline"} className="capitalize">
                    {a.role.replace("_", " ")}
                  </Badge>
                  <AdminRowActions userId={a.id} isSelf={a.id === user.id} />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
