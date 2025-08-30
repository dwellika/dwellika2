import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Heart, MessageCircle, Share } from "lucide-react"

export default function ReelsPage() {
  const reels = [
    {
      id: 1,
      title: "Creating Abstract Art with Acrylics",
      artist: "Sarah Johnson",
      thumbnail: "/placeholder.svg?height=400&width=300",
      likes: 234,
      comments: 45,
    },
    {
      id: 2,
      title: "Watercolor Landscape Techniques",
      artist: "Mike Chen",
      thumbnail: "/placeholder.svg?height=400&width=300",
      likes: 189,
      comments: 32,
    },
    {
      id: 3,
      title: "Digital Art Speed Paint",
      artist: "Emma Davis",
      thumbnail: "/placeholder.svg?height=400&width=300",
      likes: 456,
      comments: 78,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Art Reels</h1>
        <p className="text-lg text-muted-foreground">
          Watch artists create their masterpieces and learn new techniques
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reels.map((reel) => (
          <Card key={reel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative group cursor-pointer">
                <img src={reel.thumbnail || "/placeholder.svg"} alt={reel.title} className="w-full h-80 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-16 h-16 text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{reel.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">by {reel.artist}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4 mr-1" />
                      {reel.likes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {reel.comments}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
