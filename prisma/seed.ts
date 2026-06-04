import {
  PrismaClient,
  AppRole,
  ArtistTier,
  ContentStatus,
  CompetitionStatus,
  CourseLevel,
  ProductCategory,
  ReactionTarget,
  ReviewTarget,
  AnnouncementCategory,
  TestimonialGroup,
  MediaKind,
  OrderStatus,
  NotificationKind,
  CommunityRole,
  UserLevel,
} from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const HASH = bcrypt.hashSync("Demo@1234", 10)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

function future(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

function past(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────
// Delete in reverse-dependency order so FK constraints are satisfied.

async function clean() {
  await prisma.sellerVerificationDoc.deleteMany()
  await prisma.newsletterSubscriber.deleteMany()
  await prisma.moderationLog.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.userBadge.deleteMany()
  await prisma.badge.deleteMany()
  await prisma.userXp.deleteMany()
  await prisma.disputeMessage.deleteMany()
  await prisma.dispute.deleteMany()
  await prisma.orderTrackingEvent.deleteMany()
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.chatParticipant.deleteMany()
  await prisma.chat.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.workshopRegistration.deleteMany()
  await prisma.workshop.deleteMany()
  await prisma.lessonProgress.deleteMany()
  await prisma.courseCertificate.deleteMany()
  await prisma.courseEnrollment.deleteMany()
  await prisma.courseLesson.deleteMany()
  await prisma.course.deleteMany()
  await prisma.competitionWinner.deleteMany()
  await prisma.competitionVote.deleteMany()
  await prisma.competitionSubmission.deleteMany()
  await prisma.competition.deleteMany()
  await prisma.pollVote.deleteMany()
  await prisma.pollOption.deleteMany()
  await prisma.poll.deleteMany()
  await prisma.communityPost.deleteMany()
  await prisma.communityMember.deleteMany()
  await prisma.community.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.save.deleteMany()
  await prisma.like.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.reel.deleteMany()
  await prisma.artworkMedia.deleteMany()
  await prisma.artwork.deleteMany()
  await prisma.productMedia.deleteMany()
  await prisma.product.deleteMany()
  await prisma.artistProfile.deleteMany()
  await prisma.sellerProfile.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()
  console.log("✓ Cleaned all tables")
}

// ─── Users ────────────────────────────────────────────────────────────────────

async function seedUsers() {
  const users = await prisma.user.createManyAndReturn({
    data: [
      {
        email: "admin@dwellika.com",
        email_verified: new Date(),
        role: AppRole.admin,
        username: "admin_vikram",
        full_name: "Vikram Nair",
        avatar_url: "https://i.pravatar.cc/150?img=12",
        cover_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
        bio: "Platform admin & creative director at Dwellika.",
        location: "Mumbai, India",
        is_verified: true,
        password_hash: HASH,
        interests: ["digital-art", "photography", "design"],
      },
      {
        email: "artist1@dwellika.com",
        email_verified: new Date(),
        role: AppRole.artist,
        username: "priya_creates",
        full_name: "Priya Sharma",
        avatar_url: "https://i.pravatar.cc/150?img=47",
        cover_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80",
        bio: "Oil & watercolor painter from Jaipur. Inspired by Rajasthani heritage and contemporary minimalism.",
        location: "Jaipur, Rajasthan",
        is_verified: true,
        password_hash: HASH,
        interests: ["oil-painting", "watercolor", "heritage", "miniature-art"],
        website: "https://priyacreates.art",
      },
      {
        email: "artist2@dwellika.com",
        email_verified: new Date(),
        role: AppRole.artist,
        username: "kiran_abstract",
        full_name: "Kiran Mehta",
        avatar_url: "https://i.pravatar.cc/150?img=33",
        cover_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=80",
        bio: "Abstract expressionist. My work explores urban chaos through texture and bold color.",
        location: "Bangalore, Karnataka",
        is_verified: true,
        password_hash: HASH,
        interests: ["abstract", "acrylic", "mixed-media"],
      },
      {
        email: "artist3@dwellika.com",
        email_verified: new Date(),
        role: AppRole.artist,
        username: "amir_digital",
        full_name: "Amir Khan",
        avatar_url: "https://i.pravatar.cc/150?img=68",
        cover_url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200&q=80",
        bio: "Digital artist & illustrator. NFT creator. Making art accessible through technology.",
        location: "Hyderabad, Telangana",
        is_verified: false,
        password_hash: HASH,
        interests: ["digital-art", "illustration", "nft"],
      },
      {
        email: "seller@dwellika.com",
        email_verified: new Date(),
        role: AppRole.seller,
        username: "raj_artsupply",
        full_name: "Raj Kumar",
        avatar_url: "https://i.pravatar.cc/150?img=53",
        bio: "Art supply specialist. Bringing premium materials to Indian artists.",
        location: "Delhi, India",
        is_verified: true,
        password_hash: HASH,
        interests: ["art-supplies", "painting", "sculpting"],
      },
      {
        email: "user@dwellika.com",
        email_verified: new Date(),
        role: AppRole.user,
        username: "arjun_collector",
        full_name: "Arjun Singh",
        avatar_url: "https://i.pravatar.cc/150?img=15",
        bio: "Art collector & enthusiast. Supporting Indian artists one piece at a time.",
        location: "Pune, Maharashtra",
        is_verified: false,
        password_hash: HASH,
        interests: ["collecting", "contemporary-art", "sculpture"],
      },
      {
        email: "meera@dwellika.com",
        email_verified: new Date(),
        role: AppRole.user,
        username: "meera_art",
        full_name: "Meera Iyer",
        avatar_url: "https://i.pravatar.cc/150?img=41",
        bio: "Interior designer who loves incorporating original art.",
        location: "Chennai, Tamil Nadu",
        is_verified: false,
        password_hash: HASH,
        interests: ["interior-design", "photography", "prints"],
      },
    ],
  })

  const byEmail = Object.fromEntries(users.map((u) => [u.email!, u]))
  console.log(`✓ Created ${users.length} users`)
  return byEmail
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

async function seedProfiles(users: Record<string, { id: string }>) {
  await prisma.artistProfile.createMany({
    data: [
      {
        id: users["artist1@dwellika.com"].id,
        tier: ArtistTier.professional,
        specialty: "Oil & Watercolor Painting",
        styles: ["realism", "impressionism", "heritage"],
        mediums: ["oil", "watercolor", "gouache"],
        is_verified: true,
        verified_at: past(60),
        hourly_rate: 2500,
        available_for_commission: true,
        stats: { artworks: 24, followers: 1840, total_sales: 12 },
      },
      {
        id: users["artist2@dwellika.com"].id,
        tier: ArtistTier.creator,
        specialty: "Abstract Expressionism",
        styles: ["abstract", "expressionism", "contemporary"],
        mediums: ["acrylic", "oil", "mixed-media"],
        is_verified: true,
        verified_at: past(30),
        hourly_rate: 1800,
        available_for_commission: true,
        stats: { artworks: 15, followers: 920, total_sales: 6 },
      },
      {
        id: users["artist3@dwellika.com"].id,
        tier: ArtistTier.beginner,
        specialty: "Digital Illustration",
        styles: ["digital", "illustration", "fantasy"],
        mediums: ["digital", "procreate"],
        is_verified: false,
        available_for_commission: false,
        stats: { artworks: 8, followers: 320, total_sales: 2 },
      },
    ],
  })

  await prisma.sellerProfile.create({
    data: {
      id: users["seller@dwellika.com"].id,
      business_name: "Raj Art Supplies",
      legal_name: "Raj Kumar Enterprises",
      gst_number: "07AABFR1234C1Z5",
      is_verified: true,
      verified_at: past(45),
      rating_avg: 4.6,
      rating_count: 38,
      address: {
        line1: "Shop 12, Chandni Chowk",
        city: "New Delhi",
        state: "Delhi",
        postal_code: "110006",
        country: "IN",
      },
    },
  })

  await prisma.userXp.createMany({
    data: [
      { user_id: users["user@dwellika.com"].id, level: UserLevel.collector, xp: 1250 },
      { user_id: users["meera@dwellika.com"].id, level: UserLevel.explorer, xp: 340 },
      { user_id: users["artist1@dwellika.com"].id, level: UserLevel.patron, xp: 4800 },
      { user_id: users["artist2@dwellika.com"].id, level: UserLevel.collector, xp: 2100 },
    ],
  })

  console.log("✓ Created artist/seller profiles + XP")
}

// ─── Artworks ─────────────────────────────────────────────────────────────────

async function seedArtworks(users: Record<string, { id: string }>) {
  const artist1Id = users["artist1@dwellika.com"].id
  const artist2Id = users["artist2@dwellika.com"].id
  const artist3Id = users["artist3@dwellika.com"].id

  const artworks = await prisma.artwork.createManyAndReturn({
    data: [
      {
        artist_id: artist1Id,
        title: "Desert Bloom",
        slug: "desert-bloom",
        description: "A vibrant oil painting capturing the fleeting blossoms of the Thar desert after monsoon rains. Layered textures evoke the heat and life bursting through ochre sands.",
        medium: "Oil on canvas",
        style: "Impressionism",
        subject: "Landscape",
        dimensions: { width: 60, height: 90, unit: "cm" },
        prints_available: true,
        for_sale: true,
        price: 45000,
        currency: "INR",
        status: ContentStatus.approved,
        tags: ["landscape", "desert", "flowers", "rajasthan", "oil-painting"],
        view_count: 842,
        like_count: 156,
        save_count: 43,
        published_at: past(45),
      },
      {
        artist_id: artist1Id,
        title: "Haveली Twilight",
        slug: "haveli-twilight",
        description: "Warm amber light falls across an ancient haveli facade at dusk. A study in architectural beauty and fading heritage.",
        medium: "Watercolor",
        style: "Realism",
        subject: "Architecture",
        dimensions: { width: 40, height: 55, unit: "cm" },
        prints_available: false,
        for_sale: true,
        price: 28000,
        currency: "INR",
        status: ContentStatus.approved,
        tags: ["architecture", "heritage", "watercolor", "jaipur", "haveli"],
        view_count: 612,
        like_count: 98,
        save_count: 27,
        published_at: past(30),
      },
      {
        artist_id: artist1Id,
        title: "Monsoon Meditation",
        slug: "monsoon-meditation",
        description: "A lone figure under a monsoon sky. Solitude, reflection, and the poetry of rain.",
        medium: "Watercolor",
        style: "Impressionism",
        subject: "Figure",
        dimensions: { width: 35, height: 50, unit: "cm" },
        prints_available: true,
        for_sale: false,
        status: ContentStatus.approved,
        tags: ["monsoon", "figure", "rain", "meditation"],
        view_count: 390,
        like_count: 74,
        save_count: 18,
        published_at: past(20),
      },
      {
        artist_id: artist2Id,
        title: "Urban Pulse #7",
        slug: "urban-pulse-7",
        description: "Part of the ongoing Urban Pulse series. Layers of acrylic, paper scraps, and spray paint compress the energy of a city commute into 24×24 inches.",
        medium: "Mixed Media",
        style: "Abstract Expressionism",
        subject: "Urban",
        dimensions: { width: 60, height: 60, unit: "cm" },
        prints_available: true,
        for_sale: true,
        price: 32000,
        currency: "INR",
        status: ContentStatus.approved,
        tags: ["abstract", "urban", "mixed-media", "acrylic"],
        view_count: 524,
        like_count: 112,
        save_count: 34,
        published_at: past(15),
      },
      {
        artist_id: artist2Id,
        title: "Signal & Noise",
        slug: "signal-and-noise",
        description: "Bold red slashes cut through a field of monochromatic grey. A meditation on communication in the digital age.",
        medium: "Acrylic on canvas",
        style: "Abstract",
        subject: "Conceptual",
        dimensions: { width: 80, height: 100, unit: "cm" },
        prints_available: false,
        for_sale: true,
        price: 52000,
        currency: "INR",
        status: ContentStatus.approved,
        tags: ["abstract", "acrylic", "conceptual", "bold"],
        view_count: 287,
        like_count: 65,
        save_count: 21,
        published_at: past(8),
      },
      {
        artist_id: artist3Id,
        title: "Neon Devi",
        slug: "neon-devi",
        description: "A reimagining of classical Indian goddess iconography through a cyberpunk lens. Digital print, limited edition of 50.",
        medium: "Digital Art",
        style: "Digital Illustration",
        subject: "Mythology",
        prints_available: true,
        for_sale: true,
        price: 8500,
        currency: "INR",
        status: ContentStatus.approved,
        tags: ["digital", "mythology", "cyberpunk", "goddess", "illustration"],
        view_count: 1120,
        like_count: 234,
        save_count: 89,
        published_at: past(12),
      },
    ],
  })

  // Add primary media for each artwork
  await prisma.artworkMedia.createMany({
    data: [
      {
        artwork_id: artworks[0].id,
        kind: MediaKind.image,
        url: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=1200&q=80",
        thumbnail_url: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&q=60",
        width: 1200, height: 1800, position: 0, is_primary: true,
      },
      {
        artwork_id: artworks[1].id,
        kind: MediaKind.image,
        url: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=1200&q=80",
        thumbnail_url: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=400&q=60",
        width: 1200, height: 1640, position: 0, is_primary: true,
      },
      {
        artwork_id: artworks[2].id,
        kind: MediaKind.image,
        url: "https://picsum.photos/seed/dwellika-monsoon/1200/900",
        thumbnail_url: "https://picsum.photos/seed/dwellika-monsoon/400/300",
        width: 1200, height: 1714, position: 0, is_primary: true,
      },
      {
        artwork_id: artworks[3].id,
        kind: MediaKind.image,
        url: "https://images.unsplash.com/photo-1573221566340-81bdde00e00b?w=1200&q=80",
        thumbnail_url: "https://images.unsplash.com/photo-1573221566340-81bdde00e00b?w=400&q=60",
        width: 1200, height: 1200, position: 0, is_primary: true,
      },
      {
        artwork_id: artworks[4].id,
        kind: MediaKind.image,
        url: "https://picsum.photos/seed/dwellika-abstract/1200/900",
        thumbnail_url: "https://picsum.photos/seed/dwellika-abstract/400/300",
        width: 1200, height: 1500, position: 0, is_primary: true,
      },
      {
        artwork_id: artworks[5].id,
        kind: MediaKind.image,
        url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&q=80",
        thumbnail_url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=60",
        width: 1200, height: 1200, position: 0, is_primary: true,
      },
    ],
  })

  console.log(`✓ Created ${artworks.length} artworks with media`)
  return artworks
}

// ─── Products ─────────────────────────────────────────────────────────────────

async function seedProducts(users: Record<string, { id: string }>) {
  const sellerId = users["seller@dwellika.com"].id

  const products = await prisma.product.createManyAndReturn({
    data: [
      {
        seller_id: sellerId,
        category: ProductCategory.art_supplies,
        title: "Professional Watercolor Set – 48 Colors",
        slug: "pro-watercolor-48",
        description: "Artist-grade watercolor pan set with 48 vibrant, lightfast pigments. Includes a refillable water brush and mixing palette.",
        price: 2850,
        currency: "INR",
        inventory: 45,
        sku: "WC-PRO-48",
        tags: ["watercolor", "paints", "professional", "pigments"],
        attributes: { brand: "Raj Pro", colors: 48, lightfast: true, refillable: true },
        status: ContentStatus.approved,
        rating_avg: 4.7,
        rating_count: 23,
      },
      {
        seller_id: sellerId,
        category: ProductCategory.art_supplies,
        title: "Cold Press Watercolor Paper Pad – A3 (300gsm)",
        slug: "watercolor-paper-a3-300gsm",
        description: "100% cotton cold-press watercolor paper. Acid-free, 20 sheets per pad. Perfect for professional results without bleeding.",
        price: 680,
        currency: "INR",
        inventory: 120,
        sku: "PAPER-WC-A3-300",
        tags: ["paper", "watercolor", "a3", "cotton", "300gsm"],
        attributes: { gsm: 300, sheets: 20, size: "A3", surface: "cold-press", material: "100% cotton" },
        status: ContentStatus.approved,
        rating_avg: 4.8,
        rating_count: 41,
      },
      {
        seller_id: sellerId,
        category: ProductCategory.home_decor,
        title: "Rustic Wooden Easel – Tabletop",
        slug: "rustic-tabletop-easel",
        description: "Beechwood tabletop easel, adjustable canvas height 20–45cm. Folds flat for storage. Ideal for small canvases and display.",
        price: 1450,
        currency: "INR",
        inventory: 28,
        sku: "EASEL-TABLE-BW",
        tags: ["easel", "tabletop", "wooden", "beechwood"],
        attributes: { material: "beechwood", min_height_cm: 20, max_height_cm: 45, foldable: true },
        status: ContentStatus.approved,
        rating_avg: 4.5,
        rating_count: 17,
      },
      {
        seller_id: sellerId,
        category: ProductCategory.art_supplies,
        title: "Kolinsky Sable Round Brush Set – Sizes 2, 4, 6, 8",
        slug: "kolinsky-sable-round-set",
        description: "Premium Kolinsky sable hair brushes. Exceptional spring and water retention. Set of 4 round brushes in the most-used sizes.",
        price: 1950,
        currency: "INR",
        inventory: 60,
        sku: "BRUSH-SABLE-ROUND-4",
        tags: ["brushes", "sable", "kolinsky", "watercolor", "round"],
        attributes: { sizes: [2, 4, 6, 8], hair: "kolinsky-sable", series: "Pro-Aqua" },
        status: ContentStatus.approved,
        rating_avg: 4.9,
        rating_count: 29,
      },
    ],
  })

  await prisma.productMedia.createMany({
    data: [
      {
        product_id: products[0].id,
        kind: MediaKind.image,
        url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
        thumbnail_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&q=60",
        position: 0, is_primary: true,
      },
      {
        product_id: products[1].id,
        kind: MediaKind.image,
        url: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=80",
        thumbnail_url: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=300&q=60",
        position: 0, is_primary: true,
      },
      {
        product_id: products[2].id,
        kind: MediaKind.image,
        url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80",
        thumbnail_url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&q=60",
        position: 0, is_primary: true,
      },
      {
        product_id: products[3].id,
        kind: MediaKind.image,
        url: "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&q=80",
        thumbnail_url: "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=300&q=60",
        position: 0, is_primary: true,
      },
    ],
  })

  console.log(`✓ Created ${products.length} products with media`)
  return products
}

// ─── Reels ────────────────────────────────────────────────────────────────────

async function seedReels(
  users: Record<string, { id: string }>,
  artworks: { id: string }[],
  products: { id: string }[],
) {
  const reels = await prisma.reel.createManyAndReturn({
    data: [
      {
        creator_id: users["artist1@dwellika.com"].id,
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
        thumbnail_url: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=720&q=80",
        caption: "Watch Desert Bloom come to life — 3 weeks of layering captured in 60 seconds ✨ #oilpainting #timelapse #rajasthan",
        duration_sec: 62,
        artwork_id: artworks[0].id,
        tags: ["timelapse", "oilpainting", "rajasthan", "landscape"],
        status: ContentStatus.approved,
        view_count: 12480,
        like_count: 896,
        comment_count: 67,
        share_count: 124,
        published_at: past(20),
      },
      {
        creator_id: users["artist1@dwellika.com"].id,
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        thumbnail_url: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=720&q=80",
        caption: "Haveli Twilight: mixing my signature warm palette 🎨 Questions? Ask in comments!",
        duration_sec: 45,
        artwork_id: artworks[1].id,
        tags: ["watercolor", "process", "palette", "architecture"],
        status: ContentStatus.approved,
        view_count: 8340,
        like_count: 612,
        comment_count: 45,
        share_count: 88,
        published_at: past(14),
      },
      {
        creator_id: users["artist2@dwellika.com"].id,
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnail_url: "https://images.unsplash.com/photo-1573221566340-81bdde00e00b?w=720&q=80",
        caption: "Urban Pulse #7 — building layers of the city in real time. Acrylic + newspaper collage 🏙️",
        duration_sec: 78,
        artwork_id: artworks[3].id,
        tags: ["abstract", "urban", "acrylic", "collage", "process"],
        status: ContentStatus.approved,
        view_count: 6720,
        like_count: 445,
        comment_count: 38,
        share_count: 72,
        published_at: past(10),
      },
      {
        creator_id: users["artist2@dwellika.com"].id,
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail_url: "https://picsum.photos/seed/dwellika-abstract/720/1280",
        caption: "Signal & Noise — why I paint in silence 🔇 The work speaks louder than I can.",
        duration_sec: 30,
        artwork_id: artworks[4].id,
        tags: ["abstract", "conceptual", "studio"],
        status: ContentStatus.approved,
        view_count: 3890,
        like_count: 287,
        comment_count: 22,
        share_count: 41,
        published_at: past(5),
      },
      {
        creator_id: users["artist3@dwellika.com"].id,
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        thumbnail_url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=720&q=80",
        caption: "Neon Devi took 40 hours in Procreate. Here's the 2-minute breakdown 💜 #digitalart #procreate #mythology",
        duration_sec: 118,
        artwork_id: artworks[5].id,
        tags: ["digitalart", "procreate", "timelapse", "mythology"],
        status: ContentStatus.approved,
        view_count: 22600,
        like_count: 1840,
        comment_count: 142,
        share_count: 390,
        published_at: past(8),
      },
      {
        creator_id: users["seller@dwellika.com"].id,
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
        thumbnail_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=720&q=80",
        caption: "Unboxing the new 48-pan Raj Pro Watercolor set! Testing every swatch live 🎨 #arthaul #artreview #watercolor",
        duration_sec: 95,
        product_id: products[0].id,
        tags: ["arthaul", "review", "watercolor", "unboxing"],
        status: ContentStatus.approved,
        view_count: 5120,
        like_count: 382,
        comment_count: 54,
        share_count: 63,
        published_at: past(6),
      },
    ],
  })

  console.log(`✓ Created ${reels.length} reels`)
  return reels
}

// ─── Social Graph ─────────────────────────────────────────────────────────────

async function seedSocial(
  users: Record<string, { id: string }>,
  artworks: { id: string }[],
  reels: { id: string }[],
) {
  const u = users["user@dwellika.com"].id
  const m = users["meera@dwellika.com"].id
  const a1 = users["artist1@dwellika.com"].id
  const a2 = users["artist2@dwellika.com"].id
  const a3 = users["artist3@dwellika.com"].id
  const s = users["seller@dwellika.com"].id

  // Follows
  await prisma.follow.createMany({
    data: [
      { follower_id: u, following_id: a1 },
      { follower_id: u, following_id: a2 },
      { follower_id: m, following_id: a1 },
      { follower_id: m, following_id: a3 },
      { follower_id: m, following_id: s },
      { follower_id: a2, following_id: a1 },
      { follower_id: a3, following_id: a1 },
      { follower_id: a1, following_id: a2 },
    ],
  })

  // Likes on artworks
  await prisma.like.createMany({
    data: [
      { user_id: u, target_kind: ReactionTarget.artwork, target_id: artworks[0].id },
      { user_id: u, target_kind: ReactionTarget.artwork, target_id: artworks[3].id },
      { user_id: u, target_kind: ReactionTarget.artwork, target_id: artworks[5].id },
      { user_id: m, target_kind: ReactionTarget.artwork, target_id: artworks[0].id },
      { user_id: m, target_kind: ReactionTarget.artwork, target_id: artworks[1].id },
      { user_id: a2, target_kind: ReactionTarget.artwork, target_id: artworks[0].id },
      { user_id: a3, target_kind: ReactionTarget.artwork, target_id: artworks[1].id },
      // Likes on reels
      { user_id: u, target_kind: ReactionTarget.reel, target_id: reels[0].id },
      { user_id: u, target_kind: ReactionTarget.reel, target_id: reels[4].id },
      { user_id: m, target_kind: ReactionTarget.reel, target_id: reels[0].id },
      { user_id: m, target_kind: ReactionTarget.reel, target_id: reels[2].id },
    ],
  })

  // Saves
  await prisma.save.createMany({
    data: [
      { user_id: u, target_kind: ReactionTarget.artwork, target_id: artworks[0].id, collection: "wishlist" },
      { user_id: u, target_kind: ReactionTarget.artwork, target_id: artworks[5].id, collection: "wishlist" },
      { user_id: m, target_kind: ReactionTarget.artwork, target_id: artworks[0].id, collection: "favourites" },
      { user_id: m, target_kind: ReactionTarget.artwork, target_id: artworks[3].id, collection: "favourites" },
    ],
  })

  // Comments
  const comments = await prisma.comment.createManyAndReturn({
    data: [
      {
        user_id: u,
        target_kind: ReactionTarget.artwork,
        target_id: artworks[0].id,
        body: "The texture on the sand is incredible — how many layers did you build up?",
        like_count: 8,
      },
      {
        user_id: m,
        target_kind: ReactionTarget.artwork,
        target_id: artworks[0].id,
        body: "This is going on my living room wall. Absolutely stunning work, Priya.",
        like_count: 12,
      },
      {
        user_id: u,
        target_kind: ReactionTarget.reel,
        target_id: reels[4].id,
        body: "40 hours! The dedication shows — every frame is beautiful. Love the neon against the traditional pose.",
        like_count: 24,
      },
      {
        user_id: m,
        target_kind: ReactionTarget.reel,
        target_id: reels[0].id,
        body: "Watching this timelapse is so calming. Thank you for sharing your process 🙏",
        like_count: 15,
      },
    ],
  })

  // Reply to first artwork comment
  await prisma.comment.create({
    data: {
      user_id: a1,
      target_kind: ReactionTarget.artwork,
      target_id: artworks[0].id,
      parent_id: comments[0].id,
      body: "About 12 layers over 3 weeks! The key is drying fully between each pass. Happy to do a detailed video on the technique.",
      like_count: 6,
    },
  })

  console.log("✓ Created follows, likes, saves, comments")
}

// ─── Communities ──────────────────────────────────────────────────────────────

async function seedCommunities(users: Record<string, { id: string }>) {
  const a1 = users["artist1@dwellika.com"].id
  const a2 = users["artist2@dwellika.com"].id
  const u = users["user@dwellika.com"].id
  const m = users["meera@dwellika.com"].id

  const comms = await prisma.community.createManyAndReturn({
    data: [
      {
        slug: "watercolor-india",
        name: "Watercolor India",
        description: "A home for watercolor artists across India. Share work, get feedback, and join monthly challenges.",
        cover_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80",
        category: "painting",
        created_by: a1,
        member_count: 4,
      },
      {
        slug: "abstract-collective",
        name: "Abstract Collective",
        description: "Non-representational art in all media. Discussion, critique, and collaboration.",
        cover_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=80",
        category: "abstract",
        created_by: a2,
        member_count: 3,
      },
    ],
  })

  await prisma.communityMember.createMany({
    data: [
      { community_id: comms[0].id, user_id: a1, role: CommunityRole.owner },
      { community_id: comms[0].id, user_id: u, role: CommunityRole.member },
      { community_id: comms[0].id, user_id: m, role: CommunityRole.member },
      { community_id: comms[0].id, user_id: a2, role: CommunityRole.member },
      { community_id: comms[1].id, user_id: a2, role: CommunityRole.owner },
      { community_id: comms[1].id, user_id: u, role: CommunityRole.member },
      { community_id: comms[1].id, user_id: a1, role: CommunityRole.member },
    ],
  })

  const posts = await prisma.communityPost.createManyAndReturn({
    data: [
      {
        community_id: comms[0].id,
        author_id: a1,
        title: "July Challenge: Monsoon Skies",
        body: "This month's challenge theme is Monsoon Skies. Submit your entry before July 31. Any medium welcome! I'll be picking 3 winners for a feature on our homepage.",
        status: ContentStatus.approved,
        like_count: 18,
        comment_count: 7,
      },
      {
        community_id: comms[0].id,
        author_id: u,
        body: "Just started my first serious watercolor piece. Used the 300gsm Raj paper from the marketplace — absolutely no bleeding. Highly recommend!",
        status: ContentStatus.approved,
        like_count: 9,
        comment_count: 3,
      },
      {
        community_id: comms[1].id,
        author_id: a2,
        title: "What music do you paint to?",
        body: "Running a quick poll — I'm curious what gets fellow abstract artists into the zone.",
        status: ContentStatus.approved,
        like_count: 14,
        comment_count: 11,
      },
    ],
  })

  // Poll on the third post
  const poll = await prisma.poll.create({
    data: {
      post_id: posts[2].id,
      question: "What music do you listen to while painting?",
      closes_at: future(14),
      created_by: a2,
      options: {
        create: [
          { label: "Ambient / Instrumental", position: 0 },
          { label: "Classical", position: 1 },
          { label: "Electronic / Lo-Fi", position: 2 },
          { label: "Silence", position: 3 },
        ],
      },
    },
    include: { options: true },
  })

  await prisma.pollVote.createMany({
    data: [
      { poll_id: poll.id, option_id: poll.options[0].id, user_id: u },
      { poll_id: poll.id, option_id: poll.options[2].id, user_id: m },
      { poll_id: poll.id, option_id: poll.options[3].id, user_id: a1 },
    ],
  })

  console.log(`✓ Created ${comms.length} communities with posts and polls`)
}

// ─── Competitions ─────────────────────────────────────────────────────────────

async function seedCompetitions(
  users: Record<string, { id: string }>,
  artworks: { id: string }[],
) {
  const adminId = users["admin@dwellika.com"].id
  const a1 = users["artist1@dwellika.com"].id
  const a2 = users["artist2@dwellika.com"].id
  const a3 = users["artist3@dwellika.com"].id
  const u = users["user@dwellika.com"].id

  const comps = await prisma.competition.createManyAndReturn({
    data: [
      {
        slug: "monsoon-masters-2025",
        title: "Monsoon Masters 2025",
        description: "Celebrate the season of rains. Submit your best monsoon-inspired artwork in any medium. Open to all registered artists.",
        banner_url: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1200&q=80",
        rules: "1. Original work only. 2. Max 2 submissions per artist. 3. All mediums accepted. 4. Minimum size 30×40cm for physical works.",
        prize_pool: "₹50,000 + Feature + Commission opportunity",
        status: CompetitionStatus.voting,
        submissions_open_at: past(30),
        submissions_close_at: past(5),
        voting_open_at: past(5),
        voting_close_at: future(10),
        category: "Open Theme",
        created_by: adminId,
        submission_count: 2,
        vote_count: 5,
      },
      {
        slug: "digital-futures-2025",
        title: "Digital Futures 2025",
        description: "For digital artists, illustrators, and generative artists. Push the boundaries of what art can be in the digital age.",
        banner_url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200&q=80",
        rules: "Digital works only. AI-assisted works must be disclosed. High-resolution export required (min 3000px).",
        prize_pool: "₹30,000 + NFT minting + Gallery feature",
        status: CompetitionStatus.submissions_open,
        submissions_open_at: past(10),
        submissions_close_at: future(20),
        voting_open_at: future(21),
        voting_close_at: future(35),
        category: "Digital Art",
        created_by: adminId,
        submission_count: 0,
        vote_count: 0,
      },
      {
        slug: "home-spaces-2024",
        title: "Home Spaces 2024",
        description: "Art inspired by domestic life, interiors, and the feeling of home. Now closed — view the winners.",
        banner_url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80",
        prize_pool: "₹40,000",
        status: CompetitionStatus.completed,
        submissions_open_at: past(120),
        submissions_close_at: past(90),
        voting_open_at: past(90),
        voting_close_at: past(75),
        announces_at: past(70),
        category: "Interior & Home",
        created_by: adminId,
        submission_count: 1,
        vote_count: 3,
      },
    ],
  })

  // Submissions for comp[0] — voting live
  const sub1 = await prisma.competitionSubmission.create({
    data: {
      competition_id: comps[0].id,
      artist_id: a1,
      artwork_id: artworks[2].id, // Monsoon Meditation
      title: "Monsoon Meditation",
      description: "Solitude under a monsoon sky — the still moment before the storm.",
      media_url: "https://picsum.photos/seed/dwellika-monsoon/1200/900",
      status: ContentStatus.approved,
      vote_count: 3,
    },
  })

  const sub2 = await prisma.competitionSubmission.create({
    data: {
      competition_id: comps[0].id,
      artist_id: a2,
      title: "Rain on Glass",
      description: "Abstract interpretation of raindrops distorting a city window.",
      media_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
      status: ContentStatus.approved,
      vote_count: 2,
    },
  })

  // Votes
  await prisma.competitionVote.createMany({
    data: [
      { submission_id: sub1.id, voter_id: u },
      { submission_id: sub1.id, voter_id: users["meera@dwellika.com"].id },
      { submission_id: sub1.id, voter_id: a3 },
      { submission_id: sub2.id, voter_id: a1 },
      { submission_id: sub2.id, voter_id: users["admin@dwellika.com"].id },
    ],
  })

  // Winner for past comp
  const sub3 = await prisma.competitionSubmission.create({
    data: {
      competition_id: comps[2].id,
      artist_id: a1,
      title: "Golden Hour Kitchen",
      description: "Morning light in a South Indian kitchen. Watercolor on cold-press.",
      media_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
      status: ContentStatus.approved,
      vote_count: 3,
    },
  })

  await prisma.competitionWinner.create({
    data: {
      competition_id: comps[2].id,
      submission_id: sub3.id,
      rank: 1,
      prize: "₹25,000 + Home Feature",
    },
  })

  console.log(`✓ Created ${comps.length} competitions with submissions and votes`)
}

// ─── Courses & Workshops ──────────────────────────────────────────────────────

async function seedCoursesAndWorkshops(users: Record<string, { id: string }>) {
  const a1 = users["artist1@dwellika.com"].id
  const a2 = users["artist2@dwellika.com"].id
  const u = users["user@dwellika.com"].id
  const m = users["meera@dwellika.com"].id

  const courses = await prisma.course.createManyAndReturn({
    data: [
      {
        instructor_id: a1,
        slug: "watercolor-fundamentals",
        title: "Watercolor Fundamentals: From First Wash to Finished Piece",
        description: "Master the basics of watercolor — wet-on-wet, wet-on-dry, granulation, glazing, and lifting. Suitable for complete beginners.",
        cover_url: "https://picsum.photos/seed/dwellika-monsoon/1200/900",
        level: CourseLevel.beginner,
        price: 1999,
        currency: "INR",
        is_free: false,
        duration_min: 240,
        status: ContentStatus.approved,
        rating_avg: 4.8,
        rating_count: 14,
        enrollment_count: 14,
      },
      {
        instructor_id: a2,
        slug: "abstract-painting-unleashed",
        title: "Abstract Painting Unleashed: Texture, Colour & Composition",
        description: "Break free from representation. Learn to compose with instinct, work with texture-building techniques, and develop a personal abstract visual language.",
        cover_url: "https://images.unsplash.com/photo-1573221566340-81bdde00e00b?w=1200&q=80",
        level: CourseLevel.intermediate,
        price: 2499,
        currency: "INR",
        is_free: false,
        duration_min: 300,
        status: ContentStatus.approved,
        rating_avg: 4.6,
        rating_count: 9,
        enrollment_count: 9,
      },
    ],
  })

  // Lessons for course 1
  const lessons1 = await prisma.courseLesson.createManyAndReturn({
    data: [
      { course_id: courses[0].id, position: 1, title: "Materials Overview", description: "What you actually need (and what you don't). A no-BS kit guide.", duration_sec: 720, is_preview: true },
      { course_id: courses[0].id, position: 2, title: "Colour Theory for Watercolorists", duration_sec: 1080, is_preview: false },
      { course_id: courses[0].id, position: 3, title: "Wet-on-Wet Washes", duration_sec: 1440, is_preview: false },
      { course_id: courses[0].id, position: 4, title: "Wet-on-Dry Control", duration_sec: 1320, is_preview: false },
      { course_id: courses[0].id, position: 5, title: "Glazing & Luminosity", duration_sec: 1560, is_preview: false },
      { course_id: courses[0].id, position: 6, title: "Your First Finished Painting", duration_sec: 2400, is_preview: false },
    ],
  })

  // Lessons for course 2
  const lessons2 = await prisma.courseLesson.createManyAndReturn({
    data: [
      { course_id: courses[1].id, position: 1, title: "What Is Abstract Art?", description: "History, intention, and liberating yourself from likeness.", duration_sec: 900, is_preview: true },
      { course_id: courses[1].id, position: 2, title: "Texture Foundations: Palette Knife & Impasto", duration_sec: 1800, is_preview: false },
      { course_id: courses[1].id, position: 3, title: "Colour as Emotion", duration_sec: 1200, is_preview: false },
      { course_id: courses[1].id, position: 4, title: "Composition Without Rules", duration_sec: 1500, is_preview: false },
      { course_id: courses[1].id, position: 5, title: "Series Work: Building a Body of Art", duration_sec: 1800, is_preview: false },
    ],
  })

  // Enrollments
  await prisma.courseEnrollment.createMany({
    data: [
      { course_id: courses[0].id, user_id: u, progress: 66.67 },
      { course_id: courses[0].id, user_id: m, progress: 100, completed_at: past(5) },
      { course_id: courses[1].id, user_id: u, progress: 20 },
    ],
  })

  // Lesson progress for user
  await prisma.lessonProgress.createMany({
    data: [
      { user_id: u, lesson_id: lessons1[0].id, course_id: courses[0].id, completed: true, completed_at: past(15), watched_sec: 720 },
      { user_id: u, lesson_id: lessons1[1].id, course_id: courses[0].id, completed: true, completed_at: past(14), watched_sec: 1080 },
      { user_id: u, lesson_id: lessons1[2].id, course_id: courses[0].id, completed: true, completed_at: past(12), watched_sec: 1440 },
      { user_id: u, lesson_id: lessons1[3].id, course_id: courses[0].id, completed: false, watched_sec: 600 },
      { user_id: u, lesson_id: lessons2[0].id, course_id: courses[1].id, completed: true, completed_at: past(3), watched_sec: 900 },
    ],
  })

  // Certificate for meera who completed course 1
  await prisma.courseCertificate.create({
    data: {
      course_id: courses[0].id,
      user_id: m,
      metadata: { course_title: courses[0].title, instructor: "Priya Sharma" },
    },
  })

  // Workshops
  const workshops = await prisma.workshop.createManyAndReturn({
    data: [
      {
        host_id: a1,
        slug: "live-watercolor-monsoon",
        title: "Live Workshop: Painting Monsoon Scenes in Watercolor",
        description: "A 3-hour live session with Priya. We'll paint a monsoon landscape together, step by step. Materials list sent on registration.",
        cover_url: "https://picsum.photos/seed/dwellika-monsoon/1200/900",
        starts_at: future(12),
        ends_at: new Date(future(12).getTime() + 3 * 60 * 60 * 1000),
        is_live: true,
        price: 899,
        currency: "INR",
        capacity: 30,
        status: ContentStatus.approved,
      },
      {
        host_id: a2,
        slug: "abstract-intensive-july",
        title: "Abstract Painting Intensive — July Edition",
        description: "A full-day workshop exploring abstract expressionism with Kiran. Bring your canvas, we'll bring the energy.",
        cover_url: "https://images.unsplash.com/photo-1573221566340-81bdde00e00b?w=1200&q=80",
        starts_at: future(25),
        ends_at: new Date(future(25).getTime() + 6 * 60 * 60 * 1000),
        is_live: true,
        price: 2200,
        currency: "INR",
        capacity: 15,
        status: ContentStatus.approved,
      },
    ],
  })

  await prisma.workshopRegistration.createMany({
    data: [
      { workshop_id: workshops[0].id, user_id: u },
      { workshop_id: workshops[0].id, user_id: m },
    ],
  })

  console.log(`✓ Created ${courses.length} courses, ${workshops.length} workshops`)
}

// ─── Orders ───────────────────────────────────────────────────────────────────

async function seedOrders(
  users: Record<string, { id: string }>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[],
) {
  const u = users["user@dwellika.com"].id
  const m = users["meera@dwellika.com"].id
  const s = users["seller@dwellika.com"].id

  // Address for buyer
  const addr = await prisma.address.create({
    data: {
      user_id: u,
      label: "Home",
      full_name: "Arjun Singh",
      line1: "42 Shivaji Nagar",
      city: "Pune",
      state: "Maharashtra",
      postal_code: "411005",
      country: "IN",
      phone: "+919876543210",
      is_default: true,
    },
  })

  const shippingSnap = {
    full_name: "Arjun Singh",
    line1: "42 Shivaji Nagar",
    city: "Pune",
    state: "Maharashtra",
    postal_code: "411005",
    country: "IN",
    phone: "+919876543210",
  }

  // Order 1 — delivered
  const order1 = await prisma.order.create({
    data: {
      order_number: "DW-2025-0001",
      buyer_id: u,
      subtotal: 2850,
      shipping: 0,
      tax: 513,
      total: 3363,
      currency: "INR",
      status: OrderStatus.delivered,
      shipping_address: shippingSnap,
      payment_provider: "razorpay",
      payment_ref: "pay_QkR8aXtZ2m",
      paid_at: past(20),
    },
  })

  await prisma.orderItem.create({
    data: {
      order_id: order1.id,
      target_kind: "product",
      target_id: products[0].id,
      seller_id: s,
      title: products[0].title,
      image_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=60",
      unit_price: 2850,
      quantity: 1,
      subtotal: 2850,
    },
  })

  await prisma.orderTrackingEvent.createMany({
    data: [
      { order_id: order1.id, status: OrderStatus.confirmed, note: "Payment confirmed", occurred_at: past(20) },
      { order_id: order1.id, status: OrderStatus.processing, note: "Order being packed", occurred_at: past(19) },
      { order_id: order1.id, status: OrderStatus.shipped, note: "Handed to courier", carrier: "Delhivery", tracking_number: "DL88271920IN", occurred_at: past(18) },
      { order_id: order1.id, status: OrderStatus.delivered, note: "Delivered successfully", occurred_at: past(15) },
    ],
  })

  // Review for the delivered order
  await prisma.review.create({
    data: {
      reviewer_id: u,
      target_kind: ReviewTarget.product,
      target_id: products[0].id,
      order_id: order1.id,
      rating: 5,
      body: "Brilliant quality! The paints are vibrant and the pan packaging is very sturdy. Fast delivery too.",
      is_verified_purchase: true,
      helpful_count: 7,
    },
  })

  // Order 2 — processing
  const order2 = await prisma.order.create({
    data: {
      order_number: "DW-2025-0002",
      buyer_id: m,
      subtotal: 2630,
      shipping: 80,
      tax: 487,
      total: 3197,
      currency: "INR",
      status: OrderStatus.processing,
      shipping_address: {
        full_name: "Meera Iyer",
        line1: "8/3 Anna Nagar East",
        city: "Chennai",
        state: "Tamil Nadu",
        postal_code: "600102",
        country: "IN",
      },
      payment_provider: "razorpay",
      payment_ref: "pay_XhT2bRpN7k",
      paid_at: past(3),
    },
  })

  await prisma.orderItem.createMany({
    data: [
      {
        order_id: order2.id,
        target_kind: "product",
        target_id: products[1].id,
        seller_id: s,
        title: products[1].title,
        image_url: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&q=60",
        unit_price: 680,
        quantity: 2,
        subtotal: 1360,
      },
      {
        order_id: order2.id,
        target_kind: "product",
        target_id: products[3].id,
        seller_id: s,
        title: products[3].title,
        unit_price: 1950,
        quantity: 1,
        subtotal: 1950,
      },
    ],
  })

  console.log("✓ Created 2 demo orders with items, tracking, and review")
}

// ─── Notifications ────────────────────────────────────────────────────────────

async function seedNotifications(users: Record<string, { id: string }>) {
  const a1 = users["artist1@dwellika.com"].id
  const u = users["user@dwellika.com"].id
  const m = users["meera@dwellika.com"].id

  await prisma.notification.createMany({
    data: [
      {
        user_id: a1,
        kind: NotificationKind.follow,
        title: "Arjun Singh started following you",
        body: null,
        actor_id: u,
        action_url: "/profile/arjun_collector",
        created_at: past(5),
      },
      {
        user_id: a1,
        kind: NotificationKind.comment,
        title: "Arjun Singh commented on Desert Bloom",
        body: "The texture on the sand is incredible — how many layers did you build up?",
        actor_id: u,
        action_url: "/artworks/desert-bloom",
        created_at: past(4),
      },
      {
        user_id: u,
        kind: NotificationKind.order_update,
        title: "Your order DW-2025-0001 has been delivered",
        body: "Your Professional Watercolor Set has arrived!",
        action_url: "/orders/DW-2025-0001",
        created_at: past(15),
        read_at: past(14),
      },
      {
        user_id: u,
        kind: NotificationKind.competition_update,
        title: "Voting is now open — Monsoon Masters 2025",
        body: "Vote for your favourite monsoon artwork. Voting closes in 10 days.",
        action_url: "/competitions/monsoon-masters-2025",
        created_at: past(5),
      },
      {
        user_id: m,
        kind: NotificationKind.system,
        title: "You've completed Watercolor Fundamentals!",
        body: "Your certificate is ready to download.",
        action_url: "/learn/watercolor-fundamentals",
        created_at: past(5),
        read_at: past(4),
      },
    ],
  })

  console.log("✓ Created notifications")
}

// ─── Badges ───────────────────────────────────────────────────────────────────

async function seedBadges(users: Record<string, { id: string }>) {
  const badges = await prisma.badge.createManyAndReturn({
    data: [
      { slug: "early-bird", name: "Early Bird", description: "Joined during the founding period", icon_url: "/badges/early-bird.svg", category: "membership", tier: "gold" },
      { slug: "first-sale", name: "First Sale", description: "Made their first sale on Dwellika", icon_url: "/badges/first-sale.svg", category: "commerce", tier: "silver" },
      { slug: "community-star", name: "Community Star", description: "Highly active community contributor", icon_url: "/badges/community-star.svg", category: "community", tier: "silver" },
      { slug: "verified-artist", name: "Verified Artist", description: "Identity and work verified by Dwellika", icon_url: "/badges/verified.svg", category: "trust", tier: "gold" },
      { slug: "course-graduate", name: "Course Graduate", description: "Completed a Dwellika course", icon_url: "/badges/graduate.svg", category: "learning", tier: "bronze" },
    ],
  })

  await prisma.userBadge.createMany({
    data: [
      { user_id: users["artist1@dwellika.com"].id, badge_id: badges[0].id },
      { user_id: users["artist1@dwellika.com"].id, badge_id: badges[3].id },
      { user_id: users["artist2@dwellika.com"].id, badge_id: badges[0].id },
      { user_id: users["artist2@dwellika.com"].id, badge_id: badges[3].id },
      { user_id: users["seller@dwellika.com"].id, badge_id: badges[0].id },
      { user_id: users["seller@dwellika.com"].id, badge_id: badges[1].id },
      { user_id: users["meera@dwellika.com"].id, badge_id: badges[4].id },
    ],
  })

  console.log(`✓ Created ${badges.length} badges`)
}

// ─── Content Surfaces ─────────────────────────────────────────────────────────

async function seedContentSurfaces(users: Record<string, { id: string }>) {
  const a1 = users["artist1@dwellika.com"].id

  await prisma.announcement.createMany({
    data: [
      {
        category: AnnouncementCategory.event,
        title: "Monsoon Masters 2025 — Voting Now Open!",
        body: "Cast your vote for the best monsoon-themed artwork. The people's choice winner takes home ₹50,000.",
        cta_label: "Vote Now",
        cta_url: "/competitions/monsoon-masters-2025",
        image_url: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=800&q=80",
        is_pinned: true,
        ends_at: future(10),
      },
      {
        category: AnnouncementCategory.workshop,
        title: "New Live Workshop: Watercolor Monsoon with Priya Sharma",
        body: "Book your spot for a 3-hour guided session. Only 30 seats available.",
        cta_label: "Book Now",
        cta_url: "/workshops/live-watercolor-monsoon",
        ends_at: future(12),
      },
      {
        category: AnnouncementCategory.course,
        title: "Abstract Painting Unleashed — Now Enrolling",
        body: "Kiran Mehta's breakout course on abstract expressionism. Intermediate level.",
        cta_label: "Enroll",
        cta_url: "/learn/abstract-painting-unleashed",
      },
    ],
  })

  await prisma.testimonial.createMany({
    data: [
      {
        group_name: TestimonialGroup.artist,
        author_id: users["artist1@dwellika.com"].id,
        author_name: "Priya Sharma",
        role_label: "Professional Watercolorist, Jaipur",
        avatar_url: "https://i.pravatar.cc/150?img=47",
        body: "Dwellika gave my art a platform I couldn't have built alone. The competition feature brought my work to thousands of new eyes within a week of joining.",
        rating: 5,
        is_featured: true,
      },
      {
        group_name: TestimonialGroup.seller,
        author_id: users["seller@dwellika.com"].id,
        author_name: "Raj Kumar",
        role_label: "Founder, Raj Art Supplies",
        avatar_url: "https://i.pravatar.cc/150?img=53",
        body: "Selling to artists directly through Dwellika means my customers already care deeply about quality. Better conversion, less returns, happier buyers.",
        rating: 5,
        is_featured: true,
      },
      {
        group_name: TestimonialGroup.buyer,
        author_id: users["user@dwellika.com"].id,
        author_name: "Arjun Singh",
        role_label: "Art Collector, Pune",
        avatar_url: "https://i.pravatar.cc/150?img=15",
        body: "I've bought three pieces through Dwellika now. The ability to message the artist directly before purchasing — and the transparent provenance — makes it the only platform I trust.",
        rating: 5,
        is_featured: true,
      },
    ],
  })

  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: "admin@dwellika.com", user_id: users["admin@dwellika.com"].id, source: "signup" },
      { email: "artist1@dwellika.com", user_id: users["artist1@dwellika.com"].id, source: "signup" },
      { email: "user@dwellika.com", user_id: users["user@dwellika.com"].id, source: "signup" },
    ],
  })

  console.log("✓ Created announcements, testimonials, newsletter subscribers")
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding Dwellika database…\n")

  await clean()

  const users = await seedUsers()
  await seedProfiles(users)
  const artworks = await seedArtworks(users)
  const products = await seedProducts(users)
  const reels = await seedReels(users, artworks, products)
  await seedSocial(users, artworks, reels)
  await seedCommunities(users)
  await seedCompetitions(users, artworks)
  await seedCoursesAndWorkshops(users)
  await seedOrders(users, products)
  await seedNotifications(users)
  await seedBadges(users)
  await seedContentSurfaces(users)

  console.log("\n✅ Seed complete!\n")
  console.log("Demo accounts (all passwords: Demo@1234)")
  console.log("─────────────────────────────────────────")
  console.log("  admin@dwellika.com   → Admin (Vikram Nair)")
  console.log("  artist1@dwellika.com → Artist/Professional (Priya Sharma)")
  console.log("  artist2@dwellika.com → Artist/Creator (Kiran Mehta)")
  console.log("  seller@dwellika.com  → Seller (Raj Kumar)")
  console.log("  user@dwellika.com    → User/Collector (Arjun Singh)")
  console.log("  meera@dwellika.com   → User (Meera Iyer)")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
