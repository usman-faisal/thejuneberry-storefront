"use client"

import { HttpTypes } from "@medusajs/types"
import { useEffect, useRef } from "react"

type PurchasePixelTrackerProps = {
  order: HttpTypes.StoreOrder
}

/**
 * Client component that fires the Facebook Pixel 'Purchase' event once
 * when the order confirmation page loads. A ref prevents double-firing
 * in React Strict Mode.
 */
export default function PurchasePixelTracker({ order }: PurchasePixelTrackerProps) {
  const hasFired = useRef(false)

  useEffect(() => {
    if (hasFired.current) return
    if (typeof window === "undefined" || !window.fbq) return
    if (!order) return

    hasFired.current = true

    window.fbq("track", "Purchase", {
      value: (order.total ?? 0) / 100,
      currency: "PKR",
      content_ids: (order.items ?? []).map((i) => i.variant_id).filter(Boolean),
      content_type: "product",
    })
  }, [order])

  // This component renders nothing — it only fires the pixel event
  return null
}
