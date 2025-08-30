"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  const handleSignOut = () => {
    // Handle sign out logic
    console.log("Signing out...")
  }

  return (
    <Button variant="ghost" onClick={handleSignOut}>
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  )
}
