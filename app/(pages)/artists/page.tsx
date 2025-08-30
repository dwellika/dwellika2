import { ArtistList } from "@/components/artists/ArtistList"

export default function ArtistsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Meet Our Artists</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover talented artists from around the world and explore their unique styles and creations
        </p>
      </div>
      <ArtistList />
    </div>
  )
}
