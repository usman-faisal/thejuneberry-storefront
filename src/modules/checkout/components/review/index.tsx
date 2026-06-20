"use client"

import { useEffect } from "react"
import { twJoin } from "tailwind-merge"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/Button"
import PaymentButton from "@modules/checkout/components/payment-button"
import { useInitiatePaymentSession } from "hooks/cart"
import { StoreCart } from "@medusajs/types"

const Review = ({ cart }: { cart: StoreCart }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "review"

  const initiatePaymentSession = useInitiatePaymentSession()
  const activeSession = cart?.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )
  const hasDefaultSession = cart?.payment_collection?.payment_sessions?.some(
    (s) => s.provider_id === "pp_system_default"
  )

  useEffect(() => {
    if (isOpen && activeSession?.provider_id !== "pp_system_default") {
      initiatePaymentSession.mutate({ providerId: "pp_system_default" })
    }
  }, [isOpen, activeSession, initiatePaymentSession])

  // const paidByGiftcard =
  //   cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0
  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods &&
    cart.shipping_methods.length > 0
  // &&
  // cart.payment_collection

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
            {/* 5. Review */}
            4. Review
          </p>
        </div>
        {!isOpen &&
          previousStepsCompleted &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
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
            By clicking the Place Order button, you confirm that you have read,
            understand and accept our Terms of Use, Terms of Sale and Returns
            Policy and acknowledge that you have read Medusa Store&apos;s
            Privacy Policy.
          </p>
          {!hasDefaultSession || initiatePaymentSession.isPending ? (
            <Button className="w-full" isDisabled isLoading>
              Loading review...
            </Button>
          ) : (
            <PaymentButton
              cart={cart}
              selectPaymentMethod={() => {
                // Commented out redirect to payment step since it is skipped
                // router.push(pathname + "?step=payment", { scroll: false })
              }}
            />
          )}
        </>
      )}
    </>
  )
}

export default Review
