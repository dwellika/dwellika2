// NextAuth route handler — must run in Node.js (uses bcryptjs via CredentialsProvider)
export const runtime = "nodejs"

import { handlers } from "@/lib/auth/config"

export const { GET, POST } = handlers
