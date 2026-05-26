import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = { title: "Account — Settings" }

export default function AccountSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Email, language, region, and account deletion.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Account-level controls land in Phase 2. For now you can update your
          public profile under <strong>Profile</strong>.
        </p>
      </CardContent>
    </Card>
  )
}
