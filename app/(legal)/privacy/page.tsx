export const metadata = { title: "Privacy Policy" }

export default function PrivacyPage() {
  return (
    <>
      <h1 className="font-display text-4xl">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <p>
        We collect the minimum personal information required to operate
        Dwellika, never sell it, and let you export or delete it at any time.
        This summary covers the essentials; the full text below explains exactly
        what we store and why.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account essentials: your email, username, and any profile data you choose to share.</li>
        <li>Marketplace activity: orders, payouts, reviews, disputes, and addresses you provide at checkout.</li>
        <li>Content you publish: artworks, reels, posts, and the metadata attached to them.</li>
        <li>Aggregate usage analytics — anonymous metrics on pages and features used.</li>
        <li>Cookies and session tokens needed to keep you signed in and to remember preferences (e.g. theme).</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>Run the marketplace — process payments, deliver orders, and handle support.</li>
        <li>Personalize recommendations and search using only the data tied to your account.</li>
        <li>Keep the platform safe — moderation, fraud detection, and policy enforcement.</li>
        <li>Send transactional and (with consent) marketing notifications you can switch off anytime.</li>
      </ul>

      <h2>Third parties</h2>
      <p>
        We rely on a small number of processors: Supabase (database, auth, storage), Stripe and Razorpay
        (payments), and email/notification providers. Each handles only the data needed for its job, under
        contract, and we never sell personal data.
      </p>

      <h2>Your rights</h2>
      <p>
        You can request a copy or deletion of your data, opt out of marketing, and adjust cookie preferences at
        any time. Contact us at <a href="mailto:privacy@dwellika.com" className="text-primary hover:underline">privacy@dwellika.com</a>
        and we&apos;ll respond within 30 days.
      </p>
    </>
  )
}
