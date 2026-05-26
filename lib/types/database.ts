/**
 * Placeholder Database types.
 *
 * Replace this entire file by running:
 *
 *     pnpm db:types
 *
 * which runs `supabase gen types typescript --linked > lib/types/database.ts`
 * and produces a tight, schema-aware type tree.
 *
 * Until then, we keep the surface intentionally loose so the codebase
 * compiles before the project is linked. The enum exports are accurate
 * because they mirror the public enum types in supabase/migrations/.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AppRole = "super_admin" | "admin" | "artist" | "seller" | "user"
export type ArtistTier =
  | "beginner"
  | "creator"
  | "professional"
  | "master"
  | "legend"
export type UserLevel = "explorer" | "collector" | "patron" | "ambassador"
export type ContentStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "hidden"
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "returned"
  | "cancelled"
export type DisputeStatus = "open" | "reviewing" | "resolved" | "rejected"
export type ProductCategory =
  | "home_decor"
  | "art_supplies"
  | "wearing_arts"
export type ReactionTarget = "artwork" | "reel" | "post" | "product" | "comment"
export type ReviewTarget =
  | "artwork"
  | "product"
  | "workshop"
  | "seller"
  | "artist"
export type CommunityRole = "member" | "moderator" | "owner"
export type AnnouncementCategory =
  | "event"
  | "workshop"
  | "course"
  | "notification"
export type TestimonialGroup = "artist" | "seller" | "buyer"

export type Database = any

export type Tables<_T extends string = string> = any
export type TablesInsert<_T extends string = string> = any
export type TablesUpdate<_T extends string = string> = any
export type Enums<_T extends string = string> = any
