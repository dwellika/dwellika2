"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { uploadFile } from "@/lib/storage/upload"

type ActionResult = { ok: true } | { ok: false; error: string }

async function getSessionUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated.")
  return { id: session.user.id, role: session.user.role ?? "user" }
}

export async function submitEntry(formData: FormData): Promise<ActionResult | void> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Sign in to submit." }
  const userId = session.user.id

  const competitionId = String(formData.get("competition_id") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null
  const artworkId = (formData.get("artwork_id") as string) || null
  const file = formData.get("media") as File | null

  if (!competitionId || !title) return { ok: false, error: "Missing competition or title." }
  if (!file || !file.size) return { ok: false, error: "Upload an image of your submission." }

  const comp = await prisma.competition.findUnique({
    where: { id: competitionId },
    select: { status: true, slug: true },
  })
  if (!comp) return { ok: false, error: "Competition not found." }
  if (comp.status !== "submissions_open") return { ok: false, error: "Submissions aren't currently open." }

  const upload = await uploadFile(file, {
    folder: `dwellika/competitions/${competitionId}`,
    publicId: `${userId}_${Date.now()}`,
    resourceType: "image",
  })

  await prisma.competitionSubmission.upsert({
    where: { competition_id_artist_id: { competition_id: competitionId, artist_id: userId } },
    create: { competition_id: competitionId, artist_id: userId, artwork_id: artworkId, title, description, media_url: upload.url, status: "pending" },
    update: { title, description, media_url: upload.url, artwork_id: artworkId, status: "pending" },
  })

  revalidatePath(`/competitions/${comp.slug}`)
  redirect(`/competitions/${comp.slug}?submitted=1`)
}

export async function castVote(submissionId: string): Promise<ActionResult> {
  try {
    const { id: userId } = await getSessionUser()

    const sub = await prisma.competitionSubmission.findUnique({
      where: { id: submissionId },
      include: { competition: { select: { status: true } } },
    })
    if (!sub) return { ok: false, error: "Submission not found." }
    if (sub.competition.status !== "voting") return { ok: false, error: "Voting is not open." }
    if (sub.artist_id === userId) return { ok: false, error: "You can't vote for your own entry." }

    await prisma.competitionVote.create({ data: { submission_id: submissionId, voter_id: userId } })
    await prisma.competitionSubmission.update({
      where: { id: submissionId },
      data: { vote_count: { increment: 1 } },
    })

    revalidatePath("/competitions")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function removeVote(submissionId: string): Promise<ActionResult> {
  try {
    const { id: userId } = await getSessionUser()
    await prisma.competitionVote.delete({
      where: { submission_id_voter_id: { submission_id: submissionId, voter_id: userId } },
    })
    await prisma.competitionSubmission.update({
      where: { id: submissionId },
      data: { vote_count: { decrement: 1 } },
    })
    revalidatePath("/competitions")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function announceWinners(
  competitionId: string,
  ranks: Array<{ submission_id: string; rank: number; prize?: string }>,
): Promise<ActionResult> {
  try {
    const { role } = await getSessionUser()
    if (role !== "admin" && role !== "super_admin") return { ok: false, error: "Admins only." }

    await prisma.$transaction([
      ...ranks.map((r) =>
        prisma.competitionWinner.upsert({
          where: { competition_id_rank: { competition_id: competitionId, rank: r.rank } },
          create: { competition_id: competitionId, submission_id: r.submission_id, rank: r.rank, prize: r.prize ?? null },
          update: { submission_id: r.submission_id, prize: r.prize ?? null },
        }),
      ),
      prisma.competition.update({ where: { id: competitionId }, data: { status: "completed" } }),
    ])

    revalidatePath("/competitions")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
