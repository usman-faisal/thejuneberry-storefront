"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { twJoin } from "tailwind-merge"
import { convertToLocale } from "@lib/util/money"
import ErrorMessage from "@modules/checkout/components/error-message"
import { Button } from "@/components/Button"
import {
  UiRadio,
  UiRadioBox,
  UiRadioGroup,
  UiRadioLabel,
} from "@/components/ui/Radio"
import { useCartShippingMethods, useSetShippingMethod } from "hooks/cart"
import { StoreCart } from "@medusajs/types"
import { initiatePaymentSession } from "@lib/data/cart"

const Shipping = ({ cart }: { cart: StoreCart }) => {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "shipping"

  const { data: allShippingMethods } = useCartShippingMethods(cart.id)
  const availableShippingMethods = allShippingMethods?.filter(
    (method) => !method.name.toLowerCase().includes("international")
  )

  const { mutate: setShippingMethodMutate, isPending: isSettingShipping } =
    useSetShippingMethod({ cartId: cart.id })

  const selectedShippingMethod = availableShippingMethods?.find(
    (method) => method.id === cart.shipping_methods?.[0]?.shipping_option_id
  )

  const handleSubmit = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      // Initiate COD payment session if not already active
      const activeSession = cart?.payment_collection?.payment_sessions?.find(
        (s) => s.status === "pending"
      )

      if (activeSession?.provider_id !== "pp_system_default") {
        await initiatePaymentSession("pp_system_default")
      }

      // Navigate to review
      router.push(pathname + "?step=review", { scroll: false })
    } catch (err) {
      setError(err instanceof Error ? err.message : `${err}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const set = (id: string) => {
    setShippingMethodMutate(
      { shippingMethodId: id },
      { onError: (err) => setError(err.message) }
    )
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

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
            2. Shipping
          </p>
        </div>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address && (
            <Button
              variant="link"
              onPress={() => {
                router.push(pathname + "?step=shipping", { scroll: false })
              }}
            >
              Change
            </Button>
          )}
      </div>
      {isOpen ? (
        availableShippingMethods?.length === 0 ? (
          <div>
            <p className="text-red-900">
              There are no shipping methods available for your location. Please
              contact us for further assistance.
            </p>
          </div>
        ) : (
          <div>
            <UiRadioGroup
              className="flex flex-col gap-4 mb-8"
              value={selectedShippingMethod?.id}
              onChange={set}
              aria-label="Shipping methods"
            >
              {availableShippingMethods?.map((option) => (
                <UiRadio
                  key={option.id}
                  variant="outline"
                  value={option.id}
                  className="gap-4"
                >
                  <UiRadioBox />
                  <UiRadioLabel>{option.name}</UiRadioLabel>
                  <UiRadioLabel className="ml-auto group-data-[selected=true]:font-normal">
                    {convertToLocale({
                      amount: option.amount!,
                      currency_code: cart?.currency_code,
                    })}
                  </UiRadioLabel>
                </UiRadio>
              ))}
            </UiRadioGroup>

            <ErrorMessage error={error} />

            <Button
              onPress={handleSubmit}
              isLoading={isSubmitting || isSettingShipping}
              isDisabled={!selectedShippingMethod}
            >
              Next
            </Button>
          </div>
        )
      ) : cart &&
        (cart.shipping_methods?.length ?? 0) > 0 &&
        selectedShippingMethod ? (
        <ul className="flex max-sm:flex-col flex-wrap gap-y-2 gap-x-28">
          <li className="text-grayscale-500">Shipping</li>
          <li className="text-grayscale-600">{selectedShippingMethod.name}</li>
        </ul>
      ) : null}
    </>
  )
}

export default Shipping
