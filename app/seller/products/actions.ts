"use server"

import { revalidatePath, revalidateTag } from "next/cache"

import { auth } from "@/lib/auth/config"
import {
  deleteSellerProduct,
  submitProductForReview,
  updateProductInventory,
} from "@/lib/data/products"

type ActionResult = { ok: true } | { ok: false; error: string }

async function getAuthedSeller() {
  const session = await auth()
  if (!session?.user?.id) return null
  const role = session.user.role as string | undefined
  if (!["seller", "artist", "admin", "super_admin"].includes(role ?? "")) return null
  return session.user.id
}

export async function updateInventoryAction(
  productId: string,
  inventory: number,
): Promise<ActionResult> {
  try {
    const sellerId = await getAuthedSeller()
    if (!sellerId) return { ok: false, error: "Not authorised." }
    await updateProductInventory(productId, sellerId, inventory)
    revalidatePath("/seller/products")
    revalidateTag("products")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function submitProductAction(productId: string): Promise<ActionResult> {
  try {
    const sellerId = await getAuthedSeller()
    if (!sellerId) return { ok: false, error: "Not authorised." }
    await submitProductForReview(productId, sellerId)
    revalidatePath("/seller/products")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  try {
    const sellerId = await getAuthedSeller()
    if (!sellerId) return { ok: false, error: "Not authorised." }
    await deleteSellerProduct(productId, sellerId)
    revalidatePath("/seller/products")
    revalidateTag("products")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
