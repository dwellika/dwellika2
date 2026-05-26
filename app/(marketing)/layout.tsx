import type { ReactNode } from "react"

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <div className="container-page py-16 md:py-20">{children}</div>
}
