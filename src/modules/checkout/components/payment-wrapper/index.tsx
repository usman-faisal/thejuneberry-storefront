"use client"

import { loadStripe } from "@stripe/stripe-js"
import * as React from "react"
import StripeWrapper from "@modules/checkout/components/payment-wrapper/stripe-wrapper"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import { createContext } from "react"
import { isPaypal, isStripe } from "@lib/constants"
import { withReactQueryProvider } from "@lib/util/react-query"
import { StoreCart } from "@medusajs/types"

type WrapperProps = {
  children: React.ReactNode
  cart: StoreCart
}

export const StripeContext = createContext(false)

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  return <div>{children}</div>
}

export default withReactQueryProvider(Wrapper)
