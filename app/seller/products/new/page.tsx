import { requireRole } from "@/lib/auth/rbac"

import { NewProductForm } from "./NewProductForm"

export const metadata = { title: "Add product — Seller" }

export default async function NewProductPage() {
  await requireRole("seller", "admin", "super_admin", "artist")

  return (
    <div className="container-page pb-16 pt-16 sm:pt-20">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Seller studio</p>
        <h1 className="font-display text-4xl">Add a product</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Upload photos, set your price and quantity. Submitted listings are reviewed by
          our team before appearing in the shop.
        </p>
      </header>

      <NewProductForm />
    </div>
  )
}
