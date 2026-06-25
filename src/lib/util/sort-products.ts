import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

interface MinPricedProduct extends HttpTypes.StoreProduct {
  _minPrice?: number
}

const getFeaturedRank = (product: HttpTypes.StoreProduct) => {
  const rank = product.metadata?.featured_rank

  if (typeof rank === "number") {
    return rank
  }

  if (typeof rank === "string") {
    const parsedRank = Number.parseInt(rank, 10)
    return Number.isFinite(parsedRank) ? parsedRank : null
  }

  return null
}

/**
 * Helper function to sort products by price until the store API supports sorting by price
 * @param products
 * @param sortBy
 * @returns products sorted by price
 */
export function sortProducts(
  products: HttpTypes.StoreProduct[],
  sortBy: SortOptions
): HttpTypes.StoreProduct[] {
  const sortedProducts = products as MinPricedProduct[]

  if (["price_asc", "price_desc"].includes(sortBy)) {
    // Precompute the minimum price for each product
    sortedProducts.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        product._minPrice = Math.min(
          ...product.variants.map(
            (variant) => variant?.calculated_price?.calculated_amount || 0
          )
        )
      } else {
        product._minPrice = Infinity
      }
    })

    // Sort products based on the precomputed minimum prices
    sortedProducts.sort((a, b) => {
      const diff = a._minPrice! - b._minPrice!
      return sortBy === "price_asc" ? diff : -diff
    })
  }

  if (sortBy === "created_at") {
    sortedProducts.sort((a, b) => {
      const aFeaturedRank = getFeaturedRank(a)
      const bFeaturedRank = getFeaturedRank(b)

      if (aFeaturedRank !== null || bFeaturedRank !== null) {
        if (aFeaturedRank === null) {
          return 1
        }

        if (bFeaturedRank === null) {
          return -1
        }

        return aFeaturedRank - bFeaturedRank
      }

      return (
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      )
    })
  }

  return sortedProducts
}
