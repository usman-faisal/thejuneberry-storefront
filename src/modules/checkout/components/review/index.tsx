"use client"

import { StoreCart } from "@medusajs/types"
import { Button } from "@/components/Button"

const Review = ({ cart, isPlacingOrder }: { cart: StoreCart, isPlacingOrder: boolean }) => {
  return (
    <div>
      <p className="mb-6 text-sm text-grayscale-500 leading-relaxed">
        By clicking the Place Order button, you confirm your order with Cash on Delivery (COD).
        We will prepare your premium fabric and nationwide delivery will arrive within 3-5 working days.
        Thank you for shopping with The Juneberry!
      </p>

      <Button
        type="submit"
        form="checkout-addresses-form"
        className="w-full"
        isLoading={isPlacingOrder}
        isDisabled={isPlacingOrder}
      >
        Place order
      </Button>
    </div>
  )
}

export default Review
