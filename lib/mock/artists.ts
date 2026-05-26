export interface MockArtist {
  id: string
  username: string
  name: string
  tier: "beginner" | "creator" | "professional" | "master" | "legend"
  specialty: string
  location: string
  avatar: string
  cover: string
  followers: number
  works: number
  verified: boolean
  socials?: { twitter?: string; instagram?: string }
}

const portraitSeeds = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=640&q=80",
]

const coverSeeds = [
  "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1280&q=80",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1280&q=80",
  "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1280&q=80",
  "https://images.unsplash.com/photo-1502691876148-a84978e59af8?auto=format&fit=crop&w=1280&q=80",
  "https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&w=1280&q=80",
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1280&q=80",
  "https://images.unsplash.com/photo-1577720580479-7d839d829c73?auto=format&fit=crop&w=1280&q=80",
  "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=1280&q=80",
]

export const MOCK_ARTISTS: MockArtist[] = [
  {
    id: "a1",
    username: "mira_sen",
    name: "Mira Sen",
    tier: "master",
    specialty: "Watercolor",
    location: "Mumbai, IN",
    avatar: portraitSeeds[0],
    cover: coverSeeds[0],
    followers: 24800,
    works: 132,
    verified: true,
    socials: { instagram: "mira.sen" },
  },
  {
    id: "a2",
    username: "kenji_tanaka",
    name: "Kenji Tanaka",
    tier: "professional",
    specialty: "Digital Painting",
    location: "Kyoto, JP",
    avatar: portraitSeeds[1],
    cover: coverSeeds[1],
    followers: 18200,
    works: 96,
    verified: true,
  },
  {
    id: "a3",
    username: "ines_carvalho",
    name: "Inês Carvalho",
    tier: "creator",
    specialty: "Sculpture",
    location: "Lisbon, PT",
    avatar: portraitSeeds[2],
    cover: coverSeeds[2],
    followers: 9400,
    works: 41,
    verified: false,
  },
  {
    id: "a4",
    username: "amari_okonkwo",
    name: "Amari Okonkwo",
    tier: "professional",
    specialty: "Mixed Media",
    location: "Lagos, NG",
    avatar: portraitSeeds[3],
    cover: coverSeeds[3],
    followers: 15600,
    works: 78,
    verified: true,
  },
  {
    id: "a5",
    username: "lior_band",
    name: "Lior Band",
    tier: "legend",
    specialty: "Oil Painting",
    location: "Tel Aviv, IL",
    avatar: portraitSeeds[4],
    cover: coverSeeds[4],
    followers: 41200,
    works: 214,
    verified: true,
  },
  {
    id: "a6",
    username: "ayaka_morimoto",
    name: "Ayaka Morimoto",
    tier: "creator",
    specialty: "Origami",
    location: "Tokyo, JP",
    avatar: portraitSeeds[5],
    cover: coverSeeds[5],
    followers: 7300,
    works: 58,
    verified: false,
  },
  {
    id: "a7",
    username: "diego_alvarez",
    name: "Diego Álvarez",
    tier: "professional",
    specialty: "Charcoal",
    location: "Madrid, ES",
    avatar: portraitSeeds[6],
    cover: coverSeeds[6],
    followers: 12800,
    works: 87,
    verified: true,
  },
  {
    id: "a8",
    username: "priya_menon",
    name: "Priya Menon",
    tier: "master",
    specialty: "Textile Art",
    location: "Bengaluru, IN",
    avatar: portraitSeeds[7],
    cover: coverSeeds[7],
    followers: 21100,
    works: 109,
    verified: true,
  },
]
