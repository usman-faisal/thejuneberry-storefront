"use client"

import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import {
  FREE_DELIVERY_THRESHOLD,
  getDeliverySubtotal,
  isFreeDeliveryEligible,
} from "@lib/util/delivery"
import { Icon } from "@/components/Icon"
import { twMerge } from "tailwind-merge"

type FreeDeliveryBannerProps = {
  cart: HttpTypes.StoreCart
  className?: string
}

const FreeDeliveryBanner = ({ cart, className }: FreeDeliveryBannerProps) => {
  const currency_code = cart.currency_code
  const subtotal = getDeliverySubtotal(cart)
  const qualifiesForFreeDelivery = isFreeDeliveryEligible(cart)
  const remainingAmount = Math.max(FREE_DELIVERY_THRESHOLD - subtotal + 1, 0)

  return (
    <div
      className={twMerge(
        "border border-grayscale-200 bg-grayscale-50 px-4 py-3 text-sm",
        qualifiesForFreeDelivery && "border-black bg-white",
        className
      )}
    >
      <div className="flex gap-3">
        <Icon name="truck" className="h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <p className="font-medium">
            {qualifiesForFreeDelivery
              ? "Free delivery unlocked"
              : "Free delivery over " +
                convertToLocale({
                  amount: FREE_DELIVERY_THRESHOLD,
                  currency_code,
                })}
          </p>
          {!qualifiesForFreeDelivery && (
            <p className="mt-1 text-xs text-grayscale-500">
              Add{" "}
              {convertToLocale({
                amount: remainingAmount,
                currency_code,
              })}{" "}
              more to qualify.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default FreeDeliveryBanner
