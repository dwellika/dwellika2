"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: "Not authenticated." }

  const username = String(formData.get("username") ?? "").trim().toLowerCase()
  const fullName = String(formData.get("fullName") ?? "").trim()
  const bio = String(formData.get("bio") ?? "").trim()
  const website = String(formData.get("website") ?? "").trim()
  const location = String(formData.get("location") ?? "").trim()
  const interestsRaw = String(formData.get("interests") ?? "")
  const interests = interestsRaw
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
    return {
      ok: false,
      error:
        "Username must be 3-32 characters and only lowercase letters, numbers, or underscores.",
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username: username || null,
      full_name: fullName || null,
      bio: bio || null,
      website: website || null,
      location: location || null,
      interests,
      socials,
    })
    .eq("id", user.id)

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That username is already taken." }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath("/settings/profile")
  if (username) revalidatePath(`/u/${username}`)
  return { ok: true }
}

export async function uploadProfileImage(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated." }

  const kind = String(formData.get("kind") ?? "") as "avatar" | "cover"
  const file = formData.get("file") as File | null

  if (!file) return { ok: false, error: "No file provided." }
  if (!["avatar", "cover"].includes(kind)) {
    return { ok: false, error: "Invalid image kind." }
  }

  const bucket = kind === "avatar" ? "avatars" : "covers"
  const ext = file.name.split(".").pop() || "png"
  const path = `${user.id}/${kind}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) return { ok: false, error: uploadError.message }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  const publicUrl = data?.publicUrl
  if (!publicUrl) return { ok: false, error: "Could not resolve public URL." }

  const column = kind === "avatar" ? "avatar_url" : "cover_url"
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ [column]: publicUrl })
    .eq("id", user.id)

  if (updateError) return { ok: false, error: updateError.message }

  revalidatePath("/settings/profile")
  return { ok: true }
}
