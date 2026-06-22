"use client"

import { useEffect, useState } from "react"
import { convertToLocale } from "@lib/util/money"
import ErrorMessage from "@modules/checkout/components/error-message"
import {
  UiRadio,
  UiRadioBox,
  UiRadioGroup,
  UiRadioLabel,
} from "@/components/ui/Radio"
import { useCartShippingMethods, useSetShippingMethod } from "hooks/cart"
import { StoreCart } from "@medusajs/types"


const Shipping = ({ cart }: { cart: StoreCart }) => {
  const [error, setError] = useState<string | null>(null)
  const [hasAutoSelected, setHasAutoSelected] = useState(false)

  const { data: allShippingMethods } = useCartShippingMethods(cart.id)
  const availableShippingMethods = allShippingMethods?.filter(
    (method) => !method.name.toLowerCase().includes("international")
  )

  const { mutate: setShippingMethodMutate, isPending: isSettingShipping } =
    useSetShippingMethod({ cartId: cart.id })

  const selectedShippingMethod = availableShippingMethods?.find(
    (method) => method.id === cart.shipping_methods?.[0]?.shipping_option_id
  )

  // Auto-select the first available shipping method (flat rate) if none is selected
  useEffect(() => {
    if (
      !hasAutoSelected &&
      availableShippingMethods &&
      availableShippingMethods.length > 0 &&
      !selectedShippingMethod
    ) {
      setHasAutoSelected(true)
      setShippingMethodMutate(
        { shippingMethodId: availableShippingMethods[0].id },
        { onError: (err) => setError(err.message) }
      )
    }
  }, [availableShippingMethods, selectedShippingMethod, hasAutoSelected]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (id: string) => {
    setError(null)
    setShippingMethodMutate(
      { shippingMethodId: id },
      { onError: (err) => setError(err.message) }
    )
  }

  if (!availableShippingMethods) {
    return null
  }

  if (availableShippingMethods.length === 0) {
    return (
      <p className="text-red-900 text-sm">
        There are no shipping methods available for your location. Please
        contact us for further assistance.
      </p>
    )
  }

  return (
    <div>
      <UiRadioGroup
        className="flex flex-col gap-4"
        value={selectedShippingMethod?.id}
        onChange={set}
        aria-label="Shipping methods"
        isDisabled={isSettingShipping}
      >
        {availableShippingMethods.map((option) => (
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
    </div>
  )
}

export default Shipping
