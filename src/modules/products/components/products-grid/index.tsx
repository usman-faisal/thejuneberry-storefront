"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import { getProductsList } from "@lib/data/products"

type Props = {
  initialProducts: HttpTypes.StoreProduct[]
  initialCount: number
  initialNextPage: number | null
  countryCode: string
  pageSize: number
}

export default function ProductsGrid({
  initialProducts,
  initialCount,
  initialNextPage,
  countryCode,
  pageSize,
}: Props) {
  const [products, setProducts] = useState(initialProducts)
  const [nextPage, setNextPage] = useState(initialNextPage)
  const [loading, setLoading] = useState(false)

  const loadMore = async () => {
    if (!nextPage || loading) return
    setLoading(true)
    try {
      const result = await getProductsList({
        pageParam: nextPage,
        queryParams: { limit: pageSize },
        countryCode,
      })
      setProducts((prev) => [...prev, ...result.response.products])
      setNextPage(result.nextPage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-12 md:gap-x-8 md:gap-y-16">
        {products.map((product) => (
          <ProductPreview key={product.id} product={product} />
        ))}
      </div>

      {nextPage && (
        <div className="flex justify-center mt-16">
          <button
            onClick={loadMore}
            disabled={loading}
            className="border border-black text-black py-3 px-10 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Loading..." : "View More"}
          </button>
        </div>
      )}

      {!nextPage && products.length > 0 && (
        <p className="text-center text-grayscale-400 text-xs tracking-widest uppercase mt-16">
          All {initialCount} products shown
        </p>
      )}
    </>
  )
}
