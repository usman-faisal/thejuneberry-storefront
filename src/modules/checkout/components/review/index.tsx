"use client"
import { StoreCart } from "@medusajs/types"
import { Button } from "@/components/Button"
import { convertToLocale } from "@lib/util/money"

const Review = ({
  cart,
  isPlacingOrder,
}: {
  cart: StoreCart
  isPlacingOrder: boolean
}) => {
  const items = cart.items ?? []
  const itemCount = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)
  const currencyCode = cart.currency_code

  const fmt = (amount: number) =>
    convertToLocale({ amount, currency_code: currencyCode })

  return (
    <div className="space-y-4">

      {/* Price breakdown */}
      <div className="rounded-xl border border-grayscale-200 bg-white p-5">
        <div className="flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between text-grayscale-500">
            <span>{itemCount} item{itemCount === 1 ? "" : "s"}</span>
            <span>{fmt(cart.subtotal ?? 0)}</span>
          </div>
          <div className="flex justify-between text-grayscale-500">
            <span>Shipping</span>
            <span>{fmt(cart.shipping_total ?? 0)}</span>
          </div>
          <div className="h-px bg-grayscale-100" />
          <div className="flex justify-between text-base font-medium">
            <span>Total</span>
            <span>{fmt(cart.total ?? 0)}</span>
          </div>
        </div>
      </div>



      {/* CTA */}
      <Button
        type="submit"
        form="checkout-addresses-form"
        className="w-full h-14 text-base"
        isLoading={isPlacingOrder}
        isDisabled={isPlacingOrder}
      >
        Place order
      </Button>

      <p className="text-center text-xs text-grayscale-400">
        By placing your order you agree to our{" "}
        <a href="/terms" className="underline">terms & conditions</a>
      </p>
    </div>
  )
}

export default Review