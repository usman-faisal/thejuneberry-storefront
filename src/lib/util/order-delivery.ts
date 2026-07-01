import { HttpTypes } from "@medusajs/types"
import { FREE_DELIVERY_THRESHOLD } from "@lib/util/delivery"

type OrderLike = Pick<
  HttpTypes.StoreOrder,
  "items" | "shipping_total" | "subtotal" | "total"
>

export const getOrderItemsSubtotal = (order: OrderLike) => {
  const itemsSubtotal = (order.items ?? []).reduce((sum, item) => {
    return sum + (item.unit_price ?? 0) * (item.quantity ?? 0)
  }, 0)

  if (itemsSubtotal > 0) {
    return itemsSubtotal
  }

  return Math.max((order.subtotal ?? 0) - (order.shipping_total ?? 0), 0)
}

export const isOrderFreeDeliveryEligible = (order: OrderLike) =>
  getOrderItemsSubtotal(order) > FREE_DELIVERY_THRESHOLD

export const getDisplayOrderDeliveryAmount = (order: OrderLike) =>
  isOrderFreeDeliveryEligible(order) ? 0 : (order.shipping_total ?? 0)

export const getDisplayOrderTotal = (order: OrderLike) =>
  (order.total ?? getOrderItemsSubtotal(order) + (order.shipping_total ?? 0)) -
  (order.shipping_total ?? 0) +
  getDisplayOrderDeliveryAmount(order)
