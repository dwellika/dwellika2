import "server-only"

import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/types/database"

/**
 * Service-role Supabase client. Bypasses RLS. NEVER expose to the browser.
 * Use only in Server Actions, Route Handlers, or admin-only server code.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    )
  }

  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
