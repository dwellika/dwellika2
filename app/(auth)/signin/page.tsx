import { SignInForm } from "@/components/auth/SignInForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your Dwellika account</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
