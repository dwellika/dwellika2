import { notFound } from "next/navigation"
import { Award } from "lucide-react"

import { requireAuth } from "@/lib/auth/rbac"
import { getCourseBySlug, getCertificate } from "@/lib/data/learning"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CertificatePage({ params }: PageProps) {
  const { slug } = await params
  const user = await requireAuth()
  const course = await getCourseBySlug(slug)
  if (!course) notFound()
  const cert = await getCertificate(course.id, user.id)
  if (!cert) notFound()

  const recipient = user.full_name ?? `@${user.username ?? "artist"}`

  return (
    <div className="container-page py-16">
      <article className="mx-auto max-w-3xl rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card p-12 text-center shadow-glow">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            background:
              "radial-gradient(circle at center, hsl(var(--accent) / 0.3), transparent 60%)",
          }}
        />
        <Award className="mx-auto size-16 text-amber-400" />
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Certificate of completion
        </p>
        <h1 className="mt-6 font-display text-4xl md:text-5xl">{recipient}</h1>
        <p className="mt-3 text-muted-foreground">
          has successfully completed
        </p>
        <p className="mt-2 font-display text-2xl">{course.title}</p>
        <p className="mt-6 text-xs text-muted-foreground">
          Certificate number · {cert.certificate_no}
          <br />
          Issued · {new Date(cert.issued_at).toLocaleDateString()}
        </p>
        <p className="mt-8 text-xs text-muted-foreground">
          Verified by Dwellika · dwellika.com
        </p>
      </article>
    </div>
  )
}
