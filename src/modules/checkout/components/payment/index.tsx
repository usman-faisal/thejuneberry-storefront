"use client"

import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CreditCard } from "@medusajs/icons"
import { CardElement } from "@stripe/react-stripe-js"
import { StripeCardElementOptions } from "@stripe/stripe-js"
import { twJoin } from "tailwind-merge"
import { capitalize } from "lodash"

import { isStripe as isStripeFunc, paymentInfoMap } from "@lib/constants"
import PaymentContainer from "@modules/checkout/components/payment-container"
import { StripeContext } from "@modules/checkout/components/payment-wrapper"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentCardButton from "@modules/checkout/components/payment-card-button"

import { Button } from "@/components/Button"
import { UiRadioGroup } from "@/components/ui/Radio"
import { Input } from "@/components/Forms"
import {
  useCartPaymentMethods,
  useGetPaymentMethod,
  useSetPaymentMethod,
  useInitiatePaymentSession,
} from "hooks/cart"
import { StoreCart, StorePaymentSession } from "@medusajs/types"

const Payment = ({ cart }: { cart: StoreCart }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          color: "#050505",
          "::placeholder": {
            color: "#808080",
          },
          fontSize: "16px",
        },
      },
      classes: {
        base: "pt-[18px] pb-1 block w-full h-14.5 px-4 mt-0 border rounded-xs appearance-none focus:outline-none focus:ring-0 border-grayscale-200 hover:border-grayscale-500 focus:border-grayscale-500 transition-all ease-in-out",
      },
    }
  }, [])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const setPaymentMethod = useSetPaymentMethod()

  const activeSession = cart?.payment_collection?.payment_sessions?.find(
    (paymentSession: StorePaymentSession) => paymentSession.status === "pending"
  )
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )
  const { data: availablePaymentMethods } = useCartPaymentMethods(
    cart?.region?.id ?? ""
  )
  const isStripe = isStripeFunc(activeSession?.provider_id)
  const stripeReady = useContext(StripeContext)

  const paymentMethodId = activeSession?.data?.payment_method_id as string
  const { data: paymentMethod } = useGetPaymentMethod(paymentMethodId)

  const paymentReady =
    activeSession &&
    cart?.shipping_methods &&
    cart?.shipping_methods.length !== 0

  const handleRemoveCard = useCallback(() => {
    if (!activeSession?.id) {
      return
    }

    try {
      setPaymentMethod.mutate(
        { sessionId: activeSession.id, token: null },

        {
          onSuccess: () => {
            setCardBrand(null)
            setCardComplete(false)
          },
          onError: () => setError("Failed to remove card"),
        }
      )
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to remove card")
    }
  }, [activeSession?.id, setPaymentMethod])

  useEffect(() => {
    if (paymentMethod) {
      setCardBrand(capitalize(paymentMethod?.card?.brand))
      setCardComplete(true)
    }
  }, [paymentMethod])

  const initiatePaymentSession = useInitiatePaymentSession()

  useEffect(() => {
    if (isOpen) {
      if (activeSession?.provider_id !== "pp_system_default") {
        setIsLoading(true)
        initiatePaymentSession.mutate(
          { providerId: "pp_system_default" },
          {
            onSuccess: () => {
              setSelectedPaymentMethod("pp_system_default")
              setIsLoading(false)
            },
            onError: (err) => {
              setError(err instanceof Error ? err.message : `${err}`)
              setIsLoading(false)
            },
          }
        )
      } else if (selectedPaymentMethod !== "pp_system_default") {
        setSelectedPaymentMethod("pp_system_default")
      }
    }
  }, [isOpen, activeSession, initiatePaymentSession, selectedPaymentMethod])

  if (!cart) {
    return null
  }
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
            4. Payment
          </p>
        </div>
        {!isOpen && paymentReady && (
          <Button variant="link" onPress={handleEdit}>
            Change
          </Button>
        )}
      </div>

      <div className={isOpen ? "block" : "hidden"}>
        <div className="flex flex-col gap-4">
          <p className="text-grayscale-700 font-medium">You will pay on delivery</p>
          {error && <ErrorMessage error={error} />}
          <PaymentCardButton
            setError={setError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            selectedPaymentMethod="pp_system_default"
            createQueryString={createQueryString}
            cart={cart}
          />
        </div>
      </div>

      <div className={isOpen ? "hidden" : "block"}>
        {cart && paymentReady && activeSession ? (
          <div className="flex flex-col gap-4">
            <div className="flex max-sm:flex-col flex-wrap gap-y-2 gap-x-12">
              <div className="text-grayscale-500">Payment method</div>
              <div className="text-grayscale-600">
                Cash on Delivery
              </div>
            </div>
            <div className="flex max-sm:flex-col flex-wrap gap-y-2 gap-x-14.5">
              <div className="text-grayscale-500">Payment details</div>
              <div className="text-grayscale-600">
                You will pay on delivery
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}

export default Payment
