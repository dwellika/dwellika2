import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface ArtistPageProps {
  params: {
    artistId: string
  }
}

export default function ArtistPage({ params }: ArtistPageProps) {
  // In a real app, you'd fetch artist data based on params.artistId
  const artist = {
    id: params.artistId,
    name: "Sarah Johnson",
    specialty: "Abstract Paintings",
    bio: "Sarah is a contemporary artist known for her vibrant abstract paintings that explore themes of nature and emotion.",
    location: "San Francisco, CA",
    joinedDate: "2023",
    artworks: [
      { id: 1, title: "Ocean Dreams", price: 450, image: "/placeholder.svg?height=300&width=300" },
      { id: 2, title: "Forest Whispers", price: 380, image: "/placeholder.svg?height=300&width=300" },
      { id: 3, title: "City Lights", price: 520, image: "/placeholder.svg?height=300&width=300" },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Artist Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="md:w-1/3">
          <Image
            src="/placeholder.svg?height=400&width=400"
            alt={artist.name}
            width={400}
            height={400}
            className="rounded-lg w-full"
          />
        </div>
        <div className="md:w-2/3">
          <h1 className="text-4xl font-bold mb-2">{artist.name}</h1>
          <Badge variant="secondary" className="mb-4">
            {artist.specialty}
          </Badge>
          <p className="text-lg text-muted-foreground mb-4">{artist.bio}</p>
          <div className="space-y-2 mb-6">
            <p>
              <strong>Location:</strong> {artist.location}
            </p>
            <p>
              <strong>Member since:</strong> {artist.joinedDate}
            </p>
          </div>
          <Button size="lg">Follow Artist</Button>
        </div>
      </div>

      {/* Artist's Artworks */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Artworks</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {artist.artworks.map((artwork) => (
            <Card key={artwork.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <Image
                  src={artwork.image || "/placeholder.svg"}
                  alt={artwork.title}
                  width={300}
                  height={300}
                  className="rounded-t-lg w-full h-64 object-cover"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="mb-2">{artwork.title}</CardTitle>
                <CardDescription className="text-lg font-semibold text-primary">${artwork.price}</CardDescription>
                <Button className="w-full mt-4">Add to Cart</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
