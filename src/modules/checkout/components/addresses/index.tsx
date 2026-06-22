"use client"

import * as React from "react"
import compareAddresses from "@lib/util/compare-addresses"
import BillingAddress from "@modules/checkout/components/billing_address"
import ShippingAddress from "@modules/checkout/components/shipping-address"
import { Form } from "@/components/Forms"
import { z } from "zod"
import { useCustomer } from "hooks/customer"
import { useSetShippingAddress, addressesFormSchema } from "hooks/cart"
import { StoreCart } from "@medusajs/types"

const Addresses = ({
  cart,
  onAddressSaved,
}: {
  cart: StoreCart
  onAddressSaved?: () => void
}) => {
  const [sameAsBilling, setSameAsBilling] = React.useState(true)
  const { data: customer } = useCustomer()

  React.useEffect(() => {
    if (cart?.shipping_address && cart?.billing_address) {
      setSameAsBilling(
        compareAddresses(cart.shipping_address, cart.billing_address)
      )
    }
  }, [cart?.billing_address, cart?.shipping_address])

  const toggleSameAsBilling = React.useCallback(() => {
    setSameAsBilling((prev) => !prev)
  }, [setSameAsBilling])

  const { mutate, isPending, data } = useSetShippingAddress()

  const onSubmit = (values: z.infer<typeof addressesFormSchema>) => {
    mutate(values, {
      onSuccess: (data) => {
        if (data.success) {
          onAddressSaved?.()
        }
      },
    })
  }

  if (!cart) {
    return null
  }

  return (
    <Form
      schema={addressesFormSchema}
      onSubmit={onSubmit}
      formProps={{
        id: `checkout-addresses-form`,
      }}
      defaultValues={
        sameAsBilling
          ? {
              email: cart?.email && !cart.email.startsWith("guest_") ? cart.email : "",
              shipping_address: cart?.shipping_address || {
                first_name: "",
                last_name: "",
                company: "",
                province: "",
                city: "",
                postal_code: "",
                country_code: "",
                address_1: "",
                address_2: "",
                phone: "",
              },
              same_as_billing: "on",
            }
          : {
              email: cart?.email && !cart.email.startsWith("guest_") ? cart.email : "",
              shipping_address: cart?.shipping_address || {
                first_name: "",
                last_name: "",
                company: "",
                province: "",
                city: "",
                postal_code: "",
                country_code: "",
                address_1: "",
                address_2: "",
                phone: "",
              },
              same_as_billing: "off",
              billing_address: cart?.billing_address || {
                first_name: "",
                last_name: "",
                company: "",
                province: "",
                city: "",
                postal_code: "",
                country_code: "",
                address_1: "",
                address_2: "",
                phone: "",
              },
            }
      }
    >
      {() => (
        <>
          <ShippingAddress
            customer={customer || null}
            checked={sameAsBilling}
            onChange={toggleSameAsBilling}
            cart={cart}
          />

          {!sameAsBilling && (
            <BillingAddress cart={cart} customer={customer || null} />
          )}

          {/* Hidden submit — triggered programmatically by the Place Order flow */}
          <button
            type="submit"
            id="addresses-submit-btn"
            style={{ display: "none" }}
            aria-hidden="true"
          />

          {data?.error && (
            <p className="text-red-500 text-sm mt-2">{data.error}</p>
          )}
        </>
      )}
    </Form>
  )
}

export default Addresses
