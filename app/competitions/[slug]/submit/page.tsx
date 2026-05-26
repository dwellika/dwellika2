import { notFound, redirect } from "next/navigation"
import Image from "next/image"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth/rbac"
import { getCompetitionBySlug } from "@/lib/data/competitions"

import { SubmitForm } from "./SubmitForm"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CompetitionSubmitPage({ params }: PageProps) {
  const { slug } = await params
  const viewer = await getCurrentUser()
  if (!viewer) redirect(`/signin?next=/competitions/${slug}/submit`)

  const comp = await getCompetitionBySlug(slug)
  if (!comp) notFound()
  if (comp.status !== "submissions_open") {
    redirect(`/competitions/${slug}?closed=1`)
  }

  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Submit</p>
        <h1 className="font-display text-4xl">{comp.title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Upload your strongest piece for this competition. One submission per
          artist — you can update yours any time before the deadline.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Your entry</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmitForm competitionId={comp.id} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            {comp.banner_url ? (
              <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-xl">
                <Image src={comp.banner_url} alt="" fill sizes="33vw" className="object-cover" />
              </div>
            ) : null}
            <h3 className="font-display text-lg">{comp.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{comp.description}</p>
            {comp.rules ? (
              <>
                <h4 className="mt-4 text-sm font-medium">Rules</h4>
                <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">{comp.rules}</p>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
