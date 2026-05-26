export interface MockCompetition {
  id: string
  slug: string
  title: string
  category: string
  banner: string
  endsAt: string
  prize: string
  participants: number
}

export interface MockCommunityPost {
  id: string
  community: string
  author: string
  avatar: string
  title: string
  image: string
  likes: number
  comments: number
}

export interface MockReel {
  id: string
  title: string
  creator: string
  thumbnail: string
  views: number
}

export interface MockWorkshop {
  id: string
  title: string
  host: string
  startsAt: string
  cover: string
  price: number
  isLive: boolean
}

export interface MockSale {
  id: string
  buyer: string
  title: string
  image: string
  artist: string
  price: number
}

export interface MockAnnouncement {
  category: "event" | "workshop" | "course" | "notification"
  title: string
  body: string
  cta: string
  href: string
}

export interface MockTestimonial {
  group: "artist" | "seller" | "buyer"
  author: string
  role: string
  avatar: string
  body: string
}

const day = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString()

export const MOCK_COMPETITIONS: MockCompetition[] = [
  {
    id: "cp1",
    slug: "monthly-watercolor",
    title: "Monthly Watercolor Challenge",
    category: "Watercolor",
    banner:
      "https://images.unsplash.com/photo-1502691876148-a84978e59af8?auto=format&fit=crop&w=1280&q=80",
    endsAt: day(6),
    prize: "₹50,000 grand prize",
    participants: 312,
  },
  {
    id: "cp2",
    slug: "portrait-contest",
    title: "Portrait Contest 2026",
    category: "Portraits",
    banner:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1280&q=80",
    endsAt: day(12),
    prize: "Featured exhibition",
    participants: 187,
  },
  {
    id: "cp3",
    slug: "sculpture-spotlight",
    title: "Sculpture Spotlight",
    category: "Sculpture",
    banner:
      "https://images.unsplash.com/photo-1577083287663-9f972b9c2dc4?auto=format&fit=crop&w=1280&q=80",
    endsAt: day(3),
    prize: "Materials grant",
    participants: 96,
  },
]

export const MOCK_COMMUNITY_POSTS: MockCommunityPost[] = [
  {
    id: "p1",
    community: "Watercolor Artists",
    author: "Mira Sen",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    title: "How I built a 12-tube travel palette for monsoon plein-air",
    image:
      "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=900&q=80",
    likes: 1280,
    comments: 142,
  },
  {
    id: "p2",
    community: "Origami Club",
    author: "Ayaka Morimoto",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    title: "A wet-fold crane that defies gravity (paper specs inside)",
    image:
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80",
    likes: 864,
    comments: 91,
  },
  {
    id: "p3",
    community: "Digital Art",
    author: "Kenji Tanaka",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80",
    title: "Lighting study: 7 references, 7 takes, all my Procreate brushes",
    image:
      "https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&w=900&q=80",
    likes: 2140,
    comments: 312,
  },
]

export const MOCK_REELS: MockReel[] = [
  {
    id: "r1",
    title: "Watercolor monsoon — start to finish",
    creator: "Mira Sen",
    thumbnail:
      "https://images.unsplash.com/photo-1502691876148-a84978e59af8?auto=format&fit=crop&w=720&q=80",
    views: 184000,
  },
  {
    id: "r2",
    title: "60-second oil portrait warm-up",
    creator: "Lior Band",
    thumbnail:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=720&q=80",
    views: 96000,
  },
  {
    id: "r3",
    title: "Speed paint — galaxy in 3 minutes",
    creator: "Kenji Tanaka",
    thumbnail:
      "https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&w=720&q=80",
    views: 312000,
  },
  {
    id: "r4",
    title: "Pinch-pot to porcelain bowl",
    creator: "Inês Carvalho",
    thumbnail:
      "https://images.unsplash.com/photo-1577720643272-265f09367456?auto=format&fit=crop&w=720&q=80",
    views: 71000,
  },
  {
    id: "r5",
    title: "Charcoal lighting in 90 seconds",
    creator: "Diego Álvarez",
    thumbnail:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=720&q=80",
    views: 58000,
  },
  {
    id: "r6",
    title: "Indigo dye, six dips",
    creator: "Priya Menon",
    thumbnail:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=720&q=80",
    views: 121000,
  },
]

export const MOCK_WORKSHOPS: MockWorkshop[] = [
  {
    id: "w1",
    title: "Mastering Wet-on-Wet Watercolor",
    host: "Mira Sen",
    startsAt: day(2),
    cover:
      "https://images.unsplash.com/photo-1502691876148-a84978e59af8?auto=format&fit=crop&w=900&q=80",
    price: 0,
    isLive: true,
  },
  {
    id: "w2",
    title: "Foundations of Studio Lighting",
    host: "Lior Band",
    startsAt: day(5),
    cover:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=900&q=80",
    price: 1499,
    isLive: false,
  },
  {
    id: "w3",
    title: "Digital Sculpture in ZBrush",
    host: "Inês Carvalho",
    startsAt: day(8),
    cover:
      "https://images.unsplash.com/photo-1551913902-c92207136625?auto=format&fit=crop&w=900&q=80",
    price: 2499,
    isLive: false,
  },
]

export const MOCK_SALES: MockSale[] = [
  {
    id: "s1",
    buyer: "Anand R.",
    title: "Aurora Edge",
    image:
      "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=400&q=80",
    artist: "Mira Sen",
    price: 18500,
  },
  {
    id: "s2",
    buyer: "Sasha K.",
    title: "Glass Garden",
    image:
      "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&w=400&q=80",
    artist: "Lior Band",
    price: 32400,
  },
  {
    id: "s3",
    buyer: "Ravi M.",
    title: "Inkbloom",
    image:
      "https://images.unsplash.com/photo-1577720643272-265f09367456?auto=format&fit=crop&w=400&q=80",
    artist: "Inês Carvalho",
    price: 11200,
  },
  {
    id: "s4",
    buyer: "Maya O.",
    title: "Slow Bloom",
    image:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80",
    artist: "Priya Menon",
    price: 24900,
  },
]

export const MOCK_ANNOUNCEMENTS: MockAnnouncement[] = [
  {
    category: "event",
    title: "Aurora Art Fair 2026",
    body: "Three days of curated masterworks from 120+ artists across India.",
    cta: "Reserve a Pass",
    href: "/competitions",
  },
  {
    category: "workshop",
    title: "Mastering Watercolor with Mira Sen",
    body: "A live workshop streaming this Saturday — open to all members.",
    cta: "Join Live",
    href: "/workshops",
  },
  {
    category: "course",
    title: "Digital Sculpture 101",
    body: "A new self-paced course just dropped in the Digital Art track.",
    cta: "Enroll",
    href: "/courses",
  },
  {
    category: "notification",
    title: "Creator Fund applications open",
    body: "Submit your portfolio for grant consideration before next month.",
    cta: "Apply",
    href: "/creator-fund",
  },
]

export const MOCK_TESTIMONIALS: MockTestimonial[] = [
  {
    group: "artist",
    author: "Mira Sen",
    role: "Watercolorist · Mumbai",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80",
    body: "Dwellika gave my work a home that finally feels worthy of it. The way collectors find me here is unlike anything else I've used.",
  },
  {
    group: "artist",
    author: "Kenji Tanaka",
    role: "Digital Painter · Kyoto",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80",
    body: "The community here cares about craft, not clout. That alone changes how I work.",
  },
  {
    group: "seller",
    author: "Auralite Studio",
    role: "Art Supplies · Berlin",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&q=80",
    body: "Our small studio reached collectors and artists we never could before. Every order feels personal.",
  },
  {
    group: "buyer",
    author: "Priya Menon",
    role: "Collector · Bengaluru",
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=160&q=80",
    body: "I have bought four originals in three months. Every shipment is a love letter.",
  },
  {
    group: "buyer",
    author: "Daniel Verma",
    role: "Collector · London",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=160&q=80",
    body: "The first art platform that respects the work and the maker equally.",
  },
]
