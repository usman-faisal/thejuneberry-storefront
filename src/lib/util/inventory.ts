import { HttpTypes } from "@medusajs/types"

export function getVariantItemsInStock(variant: HttpTypes.StoreProductVariant) {
  // If we don't manage inventory, we can always add to cart
  if (variant && !variant.manage_inventory) {
    return Number.MAX_SAFE_INTEGER
  }

  // If we allow back orders on the variant, we can always add to cart
  if (variant.allow_backorder) {
    return Number.MAX_SAFE_INTEGER
  }

  // If there is inventory available, return the inventory quantity
  if (variant.manage_inventory && (variant.inventory_quantity || 0) > 0) {
    return variant.inventory_quantity!
  }

  // Otherwise, return 0
  return 0
}

export function getProductItemsInStock(product: HttpTypes.StoreProduct) {
  const variants = product.variants ?? []
  const hasUnlimitedStock = variants.some(
    (variant) => getVariantItemsInStock(variant) === Number.MAX_SAFE_INTEGER
  )

  if (hasUnlimitedStock) {
    return Number.MAX_SAFE_INTEGER
  }

  return variants.reduce((total, variant) => {
    return total + getVariantItemsInStock(variant)
  }, 0)
}

export function isProductSoldOut(product: HttpTypes.StoreProduct) {
  return getProductItemsInStock(product) === 0
}
