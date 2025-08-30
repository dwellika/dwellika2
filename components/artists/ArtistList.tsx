import { ArtistCard } from "./ArtistCard"

export function ArtistList() {
  const artists = [
    {
      id: "1",
      name: "Sarah Johnson",
      specialty: "Abstract Paintings",
      image: "/placeholder.svg?height=200&width=300",
      location: "San Francisco, CA",
      artworkCount: 24,
    },
    {
      id: "2",
      name: "Mike Chen",
      specialty: "Watercolor Landscapes",
      image: "/placeholder.svg?height=200&width=300",
      location: "Portland, OR",
      artworkCount: 18,
    },
    {
      id: "3",
      name: "Emma Davis",
      specialty: "Digital Art",
      image: "/placeholder.svg?height=200&width=300",
      location: "Austin, TX",
      artworkCount: 32,
    },
    {
      id: "4",
      name: "Alex Rivera",
      specialty: "Mixed Media",
      image: "/placeholder.svg?height=200&width=300",
      location: "Miami, FL",
      artworkCount: 15,
    },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {artists.map((artist) => (
        <ArtistCard
          key={artist.id}
          id={artist.id}
          name={artist.name}
          specialty={artist.specialty}
          image={artist.image}
          location={artist.location}
          artworkCount={artist.artworkCount}
        />
      ))}
    </div>
  )
}
