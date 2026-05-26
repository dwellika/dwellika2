export const metadata = { title: "Terms of Service" }

export default function TermsPage() {
  return (
    <>
      <h1 className="font-display text-4xl">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated: placeholder</p>
      <p>
        These terms govern your use of Dwellika. The full, lawyer-approved
        document will replace this placeholder before public launch. By using
        Dwellika you agree to engage respectfully with artists, sellers, and
        fellow members.
      </p>
      <h2>1. Accounts</h2>
      <p>You are responsible for the security of your account and any activity under it.</p>
      <h2>2. Content</h2>
      <p>You retain ownership of art you upload; you grant Dwellika a license to display it on the platform.</p>
      <h2>3. Payments</h2>
      <p>Marketplace transactions are processed by third-party providers (Stripe, Razorpay).</p>
    </>
  )
}
