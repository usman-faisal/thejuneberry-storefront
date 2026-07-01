import { HttpTypes } from "@medusajs/types"

export const FREE_DELIVERY_THRESHOLD = 10000
export const DEFAULT_DELIVERY_FEE = 300
export const FREE_DELIVERY_OPTION_NAME = "Free Delivery"

type CartLike = Pick<
  HttpTypes.StoreCart,
  "subtotal" | "currency_code" | "shipping_total" | "total"
>

export const getDeliverySubtotal = (cart: CartLike) =>
  Math.max((cart.subtotal ?? 0) - (cart.shipping_total ?? 0), 0)

export const isFreeDeliveryEligible = (cart: CartLike) =>
  getDeliverySubtotal(cart) > FREE_DELIVERY_THRESHOLD

export const getDisplayDeliveryAmount = (cart: CartLike) => {
  if (isFreeDeliveryEligible(cart)) {
    return 0
  }

  return cart.shipping_total && cart.shipping_total > 0
    ? cart.shipping_total
    : DEFAULT_DELIVERY_FEE
}

export const getDisplayCartTotal = (cart: CartLike) =>
  (cart.total ?? getDeliverySubtotal(cart) + (cart.shipping_total ?? 0)) -
  (cart.shipping_total ?? 0) +
  getDisplayDeliveryAmount(cart)

export const isFreeDeliveryOption = (option: {
  name?: string | null
  amount?: number | null
}) =>
  (option.amount ?? 0) === 0 ||
  (option.name ?? "").toLowerCase().includes("free")
