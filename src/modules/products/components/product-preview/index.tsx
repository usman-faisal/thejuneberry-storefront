import { HttpTypes } from "@medusajs/types"
import { LocalizedLink } from "@/components/LocalizedLink"
import Thumbnail from "@modules/products/components/thumbnail"
import { getProductPrice } from "@lib/util/get-product-price"
import { isProductSoldOut } from "@lib/util/inventory"

export default function ProductPreview({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  // Check if any variant has a compare_at_price set
  const hasCompareAtPrice = product.variants?.some(
    (v) =>
      v.calculated_price?.original_amount &&
      v.calculated_price.original_amount >
        (v.calculated_price.calculated_amount ?? 0)
  )

  const hasReducedPrice =
    cheapestPrice &&
    cheapestPrice.calculated_price_number <
      (cheapestPrice?.original_price_number || 0)

  const isSale = hasReducedPrice || hasCompareAtPrice
  const isSoldOut = isProductSoldOut(product)
  const badgeLabel =
    typeof product.metadata?.badge_label === "string"
      ? product.metadata.badge_label
      : null

  return (
    <LocalizedLink href={`/products/${product.handle}`}>
      <div className="relative">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="3/4"
          className="mb-4 md:mb-6"
        />
        {isSoldOut ? (
          <span className="absolute top-2 left-2 z-10 bg-white text-black border border-grayscale-200 text-[10px] tracking-widest uppercase font-medium px-2 py-0.5 rounded-sm">
            Sold out
          </span>
        ) : badgeLabel ? (
          <span className="absolute top-2 left-2 z-10 bg-black text-white text-[10px] tracking-widest uppercase font-medium px-2 py-0.5 rounded-sm">
            {badgeLabel}
          </span>
        ) : isSale ? (
          <span className="absolute top-2 left-2 z-10 bg-black text-white text-[10px] tracking-widest uppercase font-medium px-2 py-0.5 rounded-sm">
            Sale
          </span>
        ) : null}
      </div>
      <div className="flex justify-between max-md:flex-col">
        <div className="max-md:text-xs">
          <p className="mb-1 line-clamp-1 leading-snug">{product.title}</p>
          {product.collection && (
            <p className="text-grayscale-500 text-xs max-md:hidden">
              {product.collection.title}
            </p>
          )}
        </div>
        {cheapestPrice ? (
          hasReducedPrice ? (
            <div className="text-right max-md:text-left">
              <p className="font-semibold max-md:text-xs text-black">
                {cheapestPrice.calculated_price}
              </p>
              <p className="max-md:text-xs text-grayscale-400 line-through text-sm">
                {cheapestPrice.original_price}
              </p>
            </div>
          ) : (
            <div>
              <p className="font-semibold max-md:text-xs">
                {cheapestPrice.calculated_price}
              </p>
            </div>
          )
        ) : null}
      </div>
    </LocalizedLink>
  )
}
