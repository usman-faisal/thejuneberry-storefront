import { HttpTypes } from "@medusajs/types"
import { Layout, LayoutColumn } from "@/components/Layout"
import { LocalizedButtonLink } from "@/components/LocalizedLink"
import { Icon } from "@/components/Icon"
import Item from "@modules/order/components/item"
import { OrderTotals } from "@modules/order/components/OrderTotals"
import { listOrders } from "@lib/data/orders"
import { getCustomer } from "@lib/data/customer"

const WHATSAPP_NUMBER = "923313365411"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const customer = await getCustomer()
  let matchingOrders = []

  if (customer) {
    const { orders } = await listOrders()
    matchingOrders = orders?.filter((o) => o.id === order?.id)
  }

  // Construct WhatsApp message with full order details
  const shipping = order.shipping_address
  const name = [shipping?.first_name, shipping?.last_name]
    .filter(Boolean)
    .join(" ")
  const phone = shipping?.phone || ""
  const address = [
    shipping?.address_1,
    [shipping?.city, shipping?.postal_code].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ")

  const itemsText = (order.items || [])
    .map((item) => {
      const title = item.product_title || item.title || ""
      const size = item.variant?.title || "One Size"
      const qty = item.quantity || 1
      const price = item.unit_price ?? 0
      return `- ${title} (Size: ${size}) x${qty} — Rs. ${Math.round(price).toLocaleString()}`
    })
    .join("\n")

  const deliveryPrice = Math.round(order.shipping_total ?? 0).toLocaleString()
  const totalPrice = Math.round(order.total ?? 0).toLocaleString()

  const rawMessage = `New Order - The Juneberry

Order #${order.display_id}
Name: ${name}
Phone: ${phone}
Address: ${address}

Items:
${itemsText}

Delivery: Rs. ${deliveryPrice}
Total: Rs. ${totalPrice}
`

  const encodedMessage = encodeURIComponent(rawMessage)
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`

  return (
    <Layout className="py-26 md:pt-39 md:pb-36">
      <LayoutColumn
        start={{ base: 1, lg: 3, xl: 4 }}
        end={{ base: 13, lg: 11, xl: 10 }}
      >
        <h1 className="text-md md:text-2xl mb-8 md:mb-16">
          Thank you for your order!
        </h1>
        <p className="mb-4">
          We are pleased to confirm that your order has been successfully placed
          and will be processed shortly.
        </p>
        <p className="mb-8">
          Please click the button below to confirm your order via <strong>WhatsApp</strong>.<br />
          Your order number is <strong>#{order.display_id}</strong>.
        </p>
        <div className="mb-6">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba56] text-white font-medium px-6 h-12 rounded-xs transition-colors w-full sm:w-auto"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.028 2C6.486 2 2 6.48 2 12.018c0 1.77.462 3.498 1.34 5.022L2 22l5.122-1.343c1.472.802 3.124 1.222 4.81 1.224h.004c5.54 0 9.992-4.433 9.994-9.972C21.933 6.386 17.478 2 12.028 2zm5.545 13.916c-.244.685-1.201 1.246-1.656 1.312-.454.067-.9-.015-2.883-.787-2.533-.987-4.148-3.528-4.27-3.69-.123-.162-.993-1.31-1.002-2.463-.01-1.154.593-1.723.837-1.967.243-.243.535-.297.712-.297.18 0 .36.002.518.01.168.007.393-.064.615.467.227.545.78 1.884.846 2.016.068.132.113.286.023.463-.09.18-.135.277-.27.433-.135.156-.285.348-.407.468-.136.13-.277.272-.119.54.157.268.7 1.135 1.5 1.838.995.88 1.832 1.15 2.096 1.258.263.11.416.09.57.01.155-.078.67-.77 1.05-.77.158 0 .339.04.496.108.158.068 1.002.474 1.171.558.17.085.283.126.326.198.04.073.04.422-.204 1.107z"
              />
            </svg>
            Confirm Order on WhatsApp
          </a>
        </div>
        <div className="flex gap-x-6 gap-y-4 max-sm:flex-col mb-16">
          {Boolean(matchingOrders.length) && (
            <LocalizedButtonLink href={`/account/my-orders/${order.id}`}>
              Check order details
            </LocalizedButtonLink>
          )}
          <LocalizedButtonLink href="/" variant="outline">
            Back to home
          </LocalizedButtonLink>
        </div>
        <div className="flex max-sm:flex-col gap-x-4 gap-y-4 md:flex-col lg:flex-row mb-5">
          <div className="flex-1 overflow-hidden rounded-xs border border-grayscale-200 p-4">
            <div className="flex gap-4 items-center mb-8">
              <Icon name="map-pin" />
              <p className="text-grayscale-500">Shipping address</p>
            </div>
            <p>
              {[
                order.shipping_address?.first_name,
                order.shipping_address?.last_name,
              ]
                .filter(Boolean)
                .join(" ")}
              <br />
              {[
                order.shipping_address?.address_1,
                [
                  order.shipping_address?.postal_code,
                  order.shipping_address?.city,
                ]
                  .filter(Boolean)
                  .join(" "),
                order.shipping_address?.country?.display_name,
              ]
                .filter(Boolean)
                .join(", ")}
              <br />
              {order.shipping_address?.phone}
            </p>
          </div>
          <div className="flex-1 overflow-hidden rounded-xs border border-grayscale-200 p-4">
            <div className="flex gap-4 items-center mb-8">
              <Icon name="receipt" />
              <p className="text-grayscale-500">Billing address</p>
            </div>
            <p>
              {[
                order.billing_address?.first_name,
                order.billing_address?.last_name,
              ]
                .filter(Boolean)
                .join(" ")}
              <br />
              {[
                order.billing_address?.address_1,
                [
                  order.billing_address?.postal_code,
                  order.billing_address?.city,
                ]
                  .filter(Boolean)
                  .join(" "),
                order.billing_address?.country?.display_name,
              ]
                .filter(Boolean)
                .join(", ")}
              <br />
              {order.billing_address?.phone}
            </p>
          </div>
        </div>
        <div className="rounded-xs border border-grayscale-200 p-4 mb-5">
          {order.items?.map((item) => (
            <Item key={item.id} item={item} />
          ))}
        </div>
        <div className="rounded-xs border border-grayscale-200 p-4 flex max-sm:flex-col gap-y-8 gap-x-10 md:flex-wrap justify-between">
          <div className="flex items-center self-baseline gap-4">
            <Icon name="credit-card" />
            <div>
              <p className="text-grayscale-500">Payment</p>
            </div>
          </div>
          <OrderTotals order={order} />
        </div>
      </LayoutColumn>
    </Layout>
  )
}
