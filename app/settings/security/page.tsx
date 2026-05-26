import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = { title: "Security — Settings" }

export default function SecuritySettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Password and two-factor authentication.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>
          To change your password, request a reset link from{" "}
          <Link href="/forgot-password" className="underline text-foreground">
            forgot password
          </Link>{" "}
          — we&apos;ll email you a secure link.
        </p>
        <p>Two-factor authentication arrives in Phase 3.</p>
      </CardContent>
    </Card>
  )
}
