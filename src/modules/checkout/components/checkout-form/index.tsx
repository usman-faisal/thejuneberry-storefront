"use client"
import { withReactQueryProvider } from "@lib/util/react-query"
import React, { useRef, useState } from "react"
import { useRouter } from "next/navigation"

import Wrapper from "@modules/checkout/components/payment-wrapper"
import Addresses from "@modules/checkout/components/addresses"
import Shipping from "@modules/checkout/components/shipping"
import Review from "@modules/checkout/components/review"
import { useCart, useInitiatePaymentSession, usePlaceOrder } from "hooks/cart"
import { Icon } from "@/components/Icon"
import ErrorMessage from "@modules/checkout/components/error-message"

// Section header component for the flat checkout layout
function SectionHeader({
  number,
  title,
}: {
  number: number
  title: string
}) {
  return (
    <div className="flex items-center gap-4 mb-6 md:mb-8">
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "#000",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: "#fff",
          fontWeight: 600,
        }}
      >
        {number}
      </div>
      <p className="font-semibold tracking-wide">{title}</p>
    </div>
  )
}

function SectionDivider() {
  return <div className="border-t border-grayscale-200 my-8 md:my-10" />
}

export const CheckoutForm = withReactQueryProvider<{
  countryCode: string
  step: string | undefined
}>(({ countryCode }) => {
  const { data: cart, isPending } = useCart({ enabled: true })
  const router = useRouter()
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const initiatePaymentSession = useInitiatePaymentSession()
  const placeOrder = usePlaceOrder()

  const handleAddressSaved = () => {
    setIsPlacingOrder(true)
    setErrorMessage(null)

    if (!cart?.shipping_methods?.length) {
      setErrorMessage("Please select a shipping method.")
      setIsPlacingOrder(false)
      return
    }

    initiatePaymentSession.mutate({ providerId: "pp_system_default" }, {
      onSuccess: () => {
        placeOrder.mutate(null, {
          onSuccess: (data) => {
            if (data?.type === "order") {
              const code = data.order.shipping_address?.country_code?.toLowerCase() || countryCode
              router.push(`/${code}/order/confirmed/${data.order.id}`)
            } else if (data?.error) {
              setErrorMessage(typeof data.error === 'string' ? data.error : data.error.message)
              setIsPlacingOrder(false)
            }
          },
          onError: (error) => {
            setErrorMessage(error.message)
            setIsPlacingOrder(false)
          }
        })
      },
      onError: (error) => {
        setErrorMessage(error.message)
        setIsPlacingOrder(false)
      }
    })
  }

  React.useEffect(() => {
    // If cart is empty, redirect home
    if (!isPending && cart && (cart.items?.length ?? 0) === 0) {
      router.push(`/${countryCode}`)
    }
  }, [cart, isPending, countryCode, router])

  if (isPending) {
    return (
      <div className="absolute left-0 top-20 md:top-40 lg:top-0 w-[100vw] lg:max-w-[calc(100vw-((50vw-50%)+448px))] xl:max-w-[calc(100vw-((50vw-50%)+540px))] -ml-[calc(50vw-50%)] h-screen lg:w-full flex items-center justify-center">
        <Icon name="loader" className="w-10 md:w-20 animate-spin" />
      </div>
    )
  }

  if (!cart) {
    return null
  }

  return (
    <Wrapper cart={cart}>
      {/* ── 1. Delivery details ── */}
      <SectionHeader number={1} title="Delivery details" />
      <Addresses
        cart={cart}
        onAddressSaved={handleAddressSaved}
      />

      <SectionDivider />

      {/* ── 2. Shipping ── */}
      <SectionHeader number={2} title="Shipping" />
      <Shipping cart={cart} />

      <SectionDivider />

      {/* ── 3. Place Order ── */}
      <SectionHeader number={3} title="Place your order" />
      {errorMessage && (
        <div className="mb-6">
          <ErrorMessage error={errorMessage} />
        </div>
      )}
      <Review cart={cart} isPlacingOrder={isPlacingOrder} />
    </Wrapper>
  )
})
