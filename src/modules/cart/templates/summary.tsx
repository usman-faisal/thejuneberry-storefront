"use client"

import { HttpTypes } from "@medusajs/types"

import { LocalizedButtonLink, LocalizedLink } from "@/components/LocalizedLink"
import CartTotals from "@modules/cart/components/cart-totals"
import DiscountCode from "@modules/cart/components/discount-code"
import { getCheckoutStep } from "@modules/cart/utils/getCheckoutStep"
import { Icon } from "@/components/Icon"
import { useCustomer } from "hooks/customer"
import { withReactQueryProvider } from "@lib/util/react-query"
import { getPricesForVariant } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"

const WHATSAPP_NUMBER = "923313365411"

type SummaryProps = {
  cart: HttpTypes.StoreCart
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  const { data: customer, isPending } = useCustomer()

  const handleWhatsAppOrder = () => {
    if (!cart) return

    const currencyCode = cart.currency_code ?? ""

    const formatPrice = (amount: number) => {
      const formatted = convertToLocale({ amount, currency_code: currencyCode })
      if (formatted.includes("Rs") || formatted.includes("PKR")) {
        return formatted
      }
      return `Rs. ${amount}`
    }

    const itemsText = (cart.items ?? [])
      .slice()
      .sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))
      .map((item, index) => {
        const variantPrices = item.variant ? getPricesForVariant(item.variant) : null
        const unitPriceStr = variantPrices
          ? (variantPrices.calculated_price.includes("Rs") || variantPrices.calculated_price.includes("PKR")
              ? variantPrices.calculated_price
              : `Rs. ${variantPrices.calculated_price_number}`)
          : formatPrice(item.unit_price ?? 0)

        const title = item.product_title ?? item.title
        const sizeStr = item.variant?.title ? ` (Size: ${item.variant.title})` : ""
        return `${index + 1}. ${title}${sizeStr} x${item.quantity} — ${unitPriceStr}`
      })
      .join("\n")

    const subtotalVal = (cart.subtotal ?? 0) - (cart.shipping_total ?? 0)
    const subtotalStr = formatPrice(subtotalVal)
    const deliveryStr = "Rs. 300"
    const totalVal = subtotalVal + 300
    const totalStr = formatPrice(totalVal)

    const message = `Hi! I'd like to order:

${itemsText}

Subtotal: ${subtotalStr}
Delivery: ${deliveryStr}
Total: ${totalStr}

Please confirm and share delivery details.`

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank")
  }

  return (
    <>
      <CartTotals cart={cart} className="lg:pt-8" />
      {/*<DiscountCode cart={cart} />*/}
      <LocalizedButtonLink
        href={"/checkout?step=" + step}
        isFullWidth
        className="mt-6"
      >
        Proceed to checkout
      </LocalizedButtonLink>
      <button
        onClick={handleWhatsAppOrder}
        className="mt-2 w-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center gap-2 py-3 px-6 text-sm tracking-widest uppercase font-medium transition-colors rounded-none cursor-pointer h-12"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.978L2 22l5.177-1.356a9.946 9.946 0 0 0 4.832 1.252h.005c5.505 0 9.989-4.479 9.99-9.986 0-2.67-1.037-5.18-2.92-7.065A9.925 9.925 0 0 0 12.012 2zm5.72 14.102c-.313.882-1.815 1.626-2.501 1.712-.613.077-1.42.138-2.287-.138-3.555-1.134-5.834-4.708-6.012-4.945-.178-.236-1.442-1.923-1.442-3.67 0-1.748.887-2.612 1.221-2.964.33-.353.729-.441.972-.441.243 0 .487.001.699.01.222.01.522-.083.816.621.3.717 1.026 2.502 1.114 2.68.089.177.148.383.03.621-.118.238-.178.383-.355.59-.177.206-.372.459-.53.616-.178.176-.364.368-.157.721.206.353.916 1.51 1.968 2.448 1.357 1.21 2.506 1.584 2.86 1.761.354.177.56.147.768-.089.206-.236.885-1.029 1.121-1.382.236-.353.471-.294.796-.176.324.118 2.062 1.029 2.416 1.206.354.177.59.265.679.412.088.147.088.853-.225 1.735z"/>
        </svg>
        Order via WhatsApp
      </button>
      {!customer && !isPending && (
        <div className="bg-grayscale-50 mt-8 rounded-xs p-4 flex items-center text-grayscale-500 gap-4">
          <Icon name="info" />
          <p>
            Already have an account? No worries, just{" "}
            <LocalizedLink
              href="/auth/login"
              variant="underline"
              className="text-black !p-0"
            >
              log in.
            </LocalizedLink>
          </p>
        </div>
      )}
    </>
  )
}

export default withReactQueryProvider(Summary)
