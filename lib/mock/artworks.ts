export interface MockArtwork {
  id: string
  title: string
  artistId: string
  artistName: string
  medium: string
  image: string
  price?: number
  forSale: boolean
  width: number
  height: number
}

const seeds = [
  "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1551913902-c92207136625?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1502691876148-a84978e59af8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1577720643272-265f09367456?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1525693133929-da6f8e9b3d92?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?auto=format&fit=crop&w=900&q=80",
]

const dims = [
  [900, 1200], [900, 600], [900, 900], [900, 1350], [900, 700], [900, 1100],
  [900, 800], [900, 1400], [900, 600], [900, 1000], [900, 1250], [900, 900],
  [900, 720], [900, 1100], [900, 1300], [900, 950],
]

const mediums = ["Watercolor", "Oil", "Digital", "Charcoal", "Mixed Media", "Sculpture"]
const artists = [
  ["a1", "Mira Sen"],
  ["a2", "Kenji Tanaka"],
  ["a5", "Lior Band"],
  ["a8", "Priya Menon"],
  ["a3", "Inês Carvalho"],
  ["a7", "Diego Álvarez"],
]

export const MOCK_ARTWORKS: MockArtwork[] = seeds.map((image, i) => {
  const [artistId, artistName] = artists[i % artists.length]
  const [w, h] = dims[i]
  const forSale = i % 3 !== 0
  return {
    id: `w${i + 1}`,
    title: [
      "Aurora Edge",
      "Quiet Monsoon",
      "Embered Sky",
      "Studio Light No. 4",
      "Cobalt Letters",
      "Glass Garden",
      "Halflight Field",
      "Saffron Drift",
      "Inkbloom",
      "Tidewater",
      "Mountain Letterform",
      "Verdure",
      "Slow Bloom",
      "Cassia",
      "Ironwood",
      "Cradle of Light",
    ][i],
    artistId,
    artistName,
    medium: mediums[i % mediums.length],
    image,
    forSale,
    price: forSale ? 6000 + i * 1800 : undefined,
    width: w,
    height: h,
  }
})

export const FEATURED_COLLECTIONS = [
  {
    id: "c1",
    title: "Monsoon Watercolors",
    curator: "Mira Sen",
    image: seeds[0],
    count: 24,
  },
  {
    id: "c2",
    title: "Quiet Modernists",
    curator: "Editorial",
    image: seeds[3],
    count: 18,
  },
  {
    id: "c3",
    title: "Studio Portraits",
    curator: "Lior Band",
    image: seeds[7],
    count: 31,
  },
  {
    id: "c4",
    title: "Indigo & Bone",
    curator: "Priya Menon",
    image: seeds[10],
    count: 22,
  },
]
