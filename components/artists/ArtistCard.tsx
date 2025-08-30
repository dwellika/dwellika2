import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

interface ArtistCardProps {
  id: string
  name: string
  specialty: string
  image: string
  location: string
  artworkCount: number
}

export function ArtistCard({ id, name, specialty, image, location, artworkCount }: ArtistCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            width={300}
            height={200}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <Badge className="absolute top-2 right-2" variant="secondary">
            {artworkCount} works
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">{name}</h3>
          <p className="text-muted-foreground mb-2">{specialty}</p>
          <p className="text-sm text-muted-foreground mb-4">{location}</p>
          <Button asChild className="w-full">
            <Link href={`/artists/${id}`}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
