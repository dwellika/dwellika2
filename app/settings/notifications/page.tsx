import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

import { NotificationPrefsForm } from "./NotificationPrefsForm"
import { DEFAULT_PREFS, type NotificationPrefs } from "./types"

export const metadata = { title: "Notifications — Settings" }

export default async function NotificationsSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin?next=/settings/notifications")

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { notification_prefs: true },
  })

  const saved = (user?.notification_prefs ?? {}) as Record<string, unknown>
  const prefs = Object.fromEntries(
    (Object.keys(DEFAULT_PREFS) as Array<keyof NotificationPrefs>).map((k) => [
      k,
      typeof saved[k] === "boolean" ? saved[k] : DEFAULT_PREFS[k],
    ]),
  ) as NotificationPrefs

  return <NotificationPrefsForm initial={prefs} />
}
