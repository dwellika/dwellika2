"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { uploadAvatar, uploadCover } from "@/lib/storage/upload"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }
  const userId = session.user.id

  const username = String(formData.get("username") ?? "").trim().toLowerCase()
  const fullName = String(formData.get("fullName") ?? "").trim()
  const bio = String(formData.get("bio") ?? "").trim()
  const website = String(formData.get("website") ?? "").trim()
  const location = String(formData.get("location") ?? "").trim()
  const interests = String(formData.get("interests") ?? "")
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean)
    .slice(0, 12)
  const socials = {
    twitter: String(formData.get("twitter") ?? "").trim().replace(/^@/, ""),
    instagram: String(formData.get("instagram") ?? "").trim().replace(/^@/, ""),
    behance: String(formData.get("behance") ?? "").trim(),
    artstation: String(formData.get("artstation") ?? "").trim(),
  }

  if (username && !/^[a-z0-9_]{3,32}$/.test(username)) {
    return { ok: false, error: "Username must be 3-32 characters and only lowercase letters, numbers, or underscores." }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        username: username || null,
        full_name: fullName || null,
        bio: bio || null,
        website: website || null,
        location: location || null,
        interests,
        socials,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error"
    if (msg.includes("Unique constraint") && msg.includes("username")) {
      return { ok: false, error: "That username is already taken." }
    }
    return { ok: false, error: msg }
  }

  revalidatePath("/settings/profile")
  if (username) revalidatePath(`/u/${username}`)
  return { ok: true }
}

export async function uploadProfileImage(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." }
  const userId = session.user.id

  const kind = String(formData.get("kind") ?? "") as "avatar" | "cover"
  const file = formData.get("file") as File | null

  if (!file || !file.size) return { ok: false, error: "No file provided." }
  if (!["avatar", "cover"].includes(kind)) return { ok: false, error: "Invalid image kind." }

  try {
    const result = kind === "avatar" ? await uploadAvatar(file, userId) : await uploadCover(file, userId)
    const column = kind === "avatar" ? "avatar_url" : "cover_url"

    await prisma.user.update({ where: { id: userId }, data: { [column]: result.url } })

    revalidatePath("/settings/profile")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed." }
  }
}
