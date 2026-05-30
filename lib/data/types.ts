/**
 * Domain types for Phase 2 — sized to the columns defined in
 * supabase/migrations/. Replace with `supabase gen types typescript`
 * output when ready; until then these are the source of truth for
 * the UI layer.
 */

import type {
  AppRole,
  ArtistTier,
  ContentStatus,
  OrderStatus,
  ProductCategory,
  ReactionTarget,
  ReviewTarget,
  UserLevel,
} from "@/lib/types/database"

// Prisma returns Date objects and Decimal for numeric fields.
// These aliases keep the type definitions compatible with both
// the raw Prisma output and serialized/transformed values.
type DateValue = Date | string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DecimalValue = number | { toNumber(): number; [key: string]: any }

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface ProfileRow {
  id: string
  role: AppRole
  username: string | null
  full_name: string | null
  avatar_url: string | null
  cover_url: string | null
  bio: string | null
  website: string | null
  socials: Record<string, string>
  location: string | null
  interests: string[]
  is_verified: boolean
  created_at: string
}

export interface ArtistProfileRow {
  id: string
  tier: ArtistTier
  specialty: string | null
  styles: string[]
  mediums: string[]
  is_verified: boolean
  verified_at: string | null
  hourly_rate: number | null
  available_for_commission: boolean
  stats: Json
}

export interface ArtworkMediaRow {
  id: string
  artwork_id: string
  kind: "image" | "video"
  url: string
  thumbnail_url: string | null
  width: number | null
  height: number | null
  position: number
  is_primary: boolean
  created_at: DateValue
}

export interface ArtworkRow {
  id: string
  artist_id: string
  title: string
  slug: string
  description: string | null
  medium: string | null
  style: string | null
  subject: string | null
  dimensions: Json
  prints_available: boolean
  custom_size_option: boolean
  for_sale: boolean
  price: DecimalValue | null
  currency: string
  status: ContentStatus
  ai_tags: Json
  tags: string[]
  view_count: number
  like_count: number
  save_count: number
  published_at: DateValue | null
  created_at: DateValue
  updated_at: DateValue
}

export interface ProductMediaRow {
  id: string
  product_id: string
  kind: "image" | "video"
  url: string
  thumbnail_url: string | null
  position: number
  is_primary: boolean
}

export interface ProductRow {
  id: string
  seller_id: string
  category: ProductCategory
  title: string
  slug: string
  description: string | null
  price: DecimalValue
  currency: string
  inventory: number
  discount_pct: number
  sku: string | null
  tags: string[]
  attributes: Json
  status: ContentStatus
  rating_avg: DecimalValue | null
  rating_count: number
  created_at: DateValue
  updated_at: DateValue
}

export interface ReelRow {
  id: string
  creator_id: string
  video_url: string
  thumbnail_url: string | null
  caption: string | null
  duration_sec: number | null
  width: number | null
  height: number | null
  artwork_id: string | null
  product_id: string | null
  tags: string[]
  status: ContentStatus
  view_count: number
  like_count: number
  comment_count: number
  share_count: number
  published_at: string | null
  created_at: string
}

export interface ReviewRow {
  id: string
  reviewer_id: string
  target_kind: ReviewTarget
  target_id: string
  order_id: string | null
  rating: number
  body: string | null
  images: string[]
  is_verified_purchase: boolean
  is_hidden: boolean
  helpful_count: number
  created_at: string
}

export interface OrderItemRow {
  id: string
  order_id: string
  target_kind: "artwork" | "product"
  target_id: string
  seller_id: string | null
  title: string
  image_url: string | null
  unit_price: DecimalValue
  quantity: number
  subtotal: DecimalValue
  metadata: Json
}

export interface OrderRow {
  id: string
  order_number: string
  buyer_id: string
  subtotal: DecimalValue
  shipping: DecimalValue
  tax: DecimalValue
  discount: DecimalValue
  total: DecimalValue
  currency: string
  status: OrderStatus
  shipping_address: Json
  billing_address: Json | null
  payment_provider: string | null
  payment_ref: string | null
  paid_at: DateValue | null
  created_at: DateValue
}

export interface OrderTrackingEventRow {
  id: string
  order_id: string
  status: OrderStatus
  note: string | null
  carrier: string | null
  tracking_number: string | null
  occurred_at: string
}

export interface NotificationRow {
  id: string
  user_id: string
  kind:
    | "like"
    | "comment"
    | "follow"
    | "mention"
    | "order_update"
    | "competition_update"
    | "community_invite"
    | "system"
  title: string
  body: string | null
  payload: Json
  action_url: string | null
  actor_id: string | null
  read_at: DateValue | null
  created_at: DateValue
}

export interface AddressRow {
  id: string
  user_id: string
  label: string | null
  full_name: string
  line1: string
  line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  phone: string | null
  is_default: boolean
}

export interface FollowRow {
  follower_id: string
  following_id: string
  created_at: string
}

// Composite shapes returned from joins
export interface ArtistCardRow {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  cover_url: string | null
  bio: string | null
  is_verified: boolean
  location: string | null
  artist_profiles: Pick<
    ArtistProfileRow,
    "tier" | "specialty" | "styles" | "mediums" | "is_verified"
  > | null
}

export interface ArtworkWithMedia extends ArtworkRow {
  artwork_media: ArtworkMediaRow[]
  artist?: Pick<ProfileRow, "id" | "username" | "full_name" | "avatar_url"> | null
}

export interface ProductWithMedia extends ProductRow {
  product_media: ProductMediaRow[]
  seller?: Pick<ProfileRow, "id" | "username" | "full_name" | "avatar_url"> | null
}

export interface OrderWithItems extends OrderRow {
  order_items: OrderItemRow[]
  order_tracking_events?: OrderTrackingEventRow[]
}

export type { AppRole, ArtistTier, UserLevel, ContentStatus, OrderStatus, ProductCategory, ReactionTarget, ReviewTarget }
