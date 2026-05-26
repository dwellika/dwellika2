"use client"

import Link from "next/link"
import { ArrowRight, Bell, Calendar, GraduationCap, Megaphone } from "lucide-react"

import { Section } from "./Section"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MOCK_ANNOUNCEMENTS, type MockAnnouncement } from "@/lib/mock/home"

const ICONS: Record<MockAnnouncement["category"], React.ElementType> = {
  event: Megaphone,
  workshop: Calendar,
  course: GraduationCap,
  notification: Bell,
}

const TABS: { id: MockAnnouncement["category"]; label: string }[] = [
  { id: "event", label: "Events" },
  { id: "workshop", label: "Workshops" },
  { id: "course", label: "Courses" },
  { id: "notification", label: "Notifications" },
]

export function Announcements() {
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
          const items = MOCK_ANNOUNCEMENTS.filter((a) => a.category === id)
          const Icon = ICONS[id]
          return (
            <TabsContent key={id} value={id}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((a) => (
                  <Card key={a.title} className="group transition-all hover:border-primary/40">
                    <CardContent className="space-y-3 p-5">
                      <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                        <Icon className="size-3.5" /> {id}
                      </div>
                      <h3 className="font-display text-xl leading-snug">{a.title}</h3>
                      <p className="text-sm text-muted-foreground">{a.body}</p>
                      <Link
                        href={a.href}
                        className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-transform group-hover:translate-x-0.5"
                      >
                        {a.cta} <ArrowRight className="size-3.5" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </Section>
  )
}
