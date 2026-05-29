import { TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SmartImage } from "@/components/ui/smart-image"
import { MOCK_SALES } from "@/lib/mock/home"

import { Section } from "./Section"

export function RecentlySold() {
  return (
    <Section
      eyebrow="Social proof"
      title="Recently sold"
      description="Fresh out of the studios — works that found their forever homes this week."
      href="/sold"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {MOCK_SALES.map((s) => (
          <Card key={s.id} className="overflow-hidden">
            <div className="relative h-48 w-full overflow-hidden">
              <SmartImage
                src={s.image}
                alt={s.title}
                kind="artwork"
                seed={s.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
              <Badge variant="default" className="absolute left-3 top-3 gap-1 backdrop-blur">
                <TrendingUp className="size-3" /> Sold
              </Badge>
            </div>
            <CardContent className="space-y-1 p-4">
              <p className="line-clamp-1 font-display text-base">{s.title}</p>
              <p className="text-xs text-muted-foreground">
                {s.artist} → {s.buyer}
              </p>
              <p className="pt-1 font-display text-lg">₹{s.price.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  )
}
