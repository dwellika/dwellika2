# Auth setup

Dwellika ships with email/password + Google/GitHub/Apple OAuth. The UI is
already wired; the only manual work is configuring providers in your
Supabase project.

## 1. Supabase project

```bash
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push                 # applies every migration in supabase/migrations
supabase gen types typescript --linked > lib/types/database.ts
```

Set the redirect URL allow-list under
**Supabase → Authentication → URL Configuration → Redirect URLs**:

```
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/callback
```

## 2. Email / password

Already enabled by default. The "confirm your email" flow uses the link
template under **Authentication → Email Templates → Confirm signup** —
the `{{ .ConfirmationURL }}` lands on `/auth/callback`, which then routes
the user onward to `/settings/profile`.

## 3. Google OAuth

1. Visit https://console.cloud.google.com/apis/credentials.
2. Create an OAuth 2.0 Client ID (Web application).
3. **Authorized redirect URIs:** the Supabase callback URL
   `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
4. In Supabase Dashboard → **Authentication → Providers → Google**,
   enable the provider and paste in the Client ID + Secret.

## 4. GitHub OAuth

1. https://github.com/settings/developers → New OAuth App.
2. **Authorization callback URL:** `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
3. Supabase → **Authentication → Providers → GitHub** → enable and paste
   the Client ID + Secret.

## 5. Apple OAuth

Apple OAuth requires a paid Apple Developer account.

1. https://developer.apple.com/account/resources/identifiers/list → register a Services ID.
2. Enable **Sign in with Apple** capability.
3. Create a private key under **Keys** with Sign in with Apple enabled.
4. Configure return URL: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
5. Supabase → **Authentication → Providers → Apple** → enable and supply
   the Services ID, Team ID, Key ID, and the private key (PEM).

## 6. Local environment

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

You can verify auth is wired by visiting `/signin` after `pnpm dev`.
