import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = { title: "Notifications — Settings" }

export default function NotificationsSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what we email and what we surface in your bell.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Notification preferences are wired in Phase 2 alongside the realtime
          notification feed.
        </p>
      </CardContent>
    </Card>
  )
}
