"use client"

import { twJoin } from "tailwind-merge"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/Button"
import PaymentButton from "@modules/checkout/components/payment-button"
import { StoreCart } from "@medusajs/types"

const Review = ({ cart }: { cart: StoreCart }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "review"

  const hasDefaultSession = cart?.payment_collection?.payment_sessions?.some(
    (s) => s.provider_id === "pp_system_default"
  )

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods &&
    cart.shipping_methods.length > 0

  return (
    <>
      <div className="flex justify-between mb-6 md:mb-8 border-t border-grayscale-200 pt-8 mt-8">
        <div>
          <p
            className={twJoin(
              "transition-fontWeight duration-75",
              isOpen && "font-semibold"
            )}
          >
            3. Review
          </p>
        </div>
        {!isOpen &&
          previousStepsCompleted &&
          cart?.shipping_address &&
          cart?.billing_address && (
            <Button
              variant="link"
              onPress={() => {
                router.push(pathname + "?step=review", { scroll: false })
              }}
            >
              View
            </Button>
          )}
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <p className="mb-8">
            By clicking the Place Order button, you confirm your order with Cash on Delivery (COD).
            We will prepare your premium fabric and nationwide delivery will arrive within 3-5 working days.
            Thank you for shopping with The Juneberry!
          </p>
          {!hasDefaultSession ? (
            <Button className="w-full" isDisabled isLoading>
              Loading review...
            </Button>
          ) : (
            <PaymentButton
              cart={cart}
              selectPaymentMethod={() => {
                // Payment step skipped — COD is always used
              }}
            />
          )}
        </>
      )}
    </>
  )
}

export default Review
