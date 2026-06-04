"use client"

import Link from "next/link"
import { ArrowRight, Bell, Calendar, GraduationCap, Megaphone } from "lucide-react"

import { Section } from "./Section"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MOCK_ANNOUNCEMENTS, type MockAnnouncement } from "@/lib/mock/home"

type Category = MockAnnouncement["category"]

export interface AnnouncementItem {
  id: string
  category: Category
  title: string
  body: string | null
  cta: string | null
  href: string
}

const ICONS: Record<Category, React.ElementType> = {
  event: Megaphone,
  workshop: Calendar,
  course: GraduationCap,
  notification: Bell,
}

const TABS: { id: Category; label: string }[] = [
  { id: "event", label: "Events" },
  { id: "workshop", label: "Workshops" },
  { id: "course", label: "Courses" },
  { id: "notification", label: "Notifications" },
]

const MOCK_ITEMS: AnnouncementItem[] = MOCK_ANNOUNCEMENTS.map((a, i) => ({
  id: `mock-${i}`,
  category: a.category,
  title: a.title,
  body: a.body,
  cta: a.cta,
  href: a.href,
}))

export function Announcements({ items }: { items?: AnnouncementItem[] } = {}) {
  const all = items && items.length > 0 ? items : MOCK_ITEMS
  return (
    <Section eyebrow="What&apos;s next" title="Announcements">
      <Tabs defaultValue="event" className="w-full">
        <TabsList className="mb-6">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map(({ id }) => {
          const tabItems = all.filter((a) => a.category === id)
          const Icon = ICONS[id]
          return (
            <TabsContent key={id} value={id}>
              {tabItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing here right now — check back soon.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tabItems.map((a) => (
                    <Card key={a.id} className="group transition-all hover:border-primary/40">
                      <CardContent className="space-y-3 p-5">
                        <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                          <Icon className="size-3.5" /> {id}
                        </div>
                        <h3 className="font-display text-xl leading-snug">{a.title}</h3>
                        {a.body ? <p className="text-sm text-muted-foreground">{a.body}</p> : null}
                        {a.href && a.href !== "#" ? (
                          <Link
                            href={a.href}
                            className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-transform group-hover:translate-x-0.5"
                          >
                            {a.cta ?? "Learn more"} <ArrowRight className="size-3.5" />
                          </Link>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </Section>
  )
}
