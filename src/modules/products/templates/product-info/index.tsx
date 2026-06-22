import { HttpTypes } from "@medusajs/types"
import { LocalizedLink } from "@/components/LocalizedLink"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-2 text-grayscale-500 mb-2 text-xs md:text-sm">
        {product.collection && (
          <LocalizedLink
            href={`/collections/${product.collection.handle}`}
            className="hover:text-black transition-colors"
          >
            <span>{product.collection.title}</span>
          </LocalizedLink>
        )}
        {product.collection && product.categories && product.categories.length > 0 && (
          <span>•</span>
        )}
        {product.categories && product.categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2">
            {product.categories.map((c, i) => (
              <span key={c.id ?? c.handle} className="flex items-center gap-x-2">
                {i > 0 && <span aria-hidden="true">,</span>}
                <LocalizedLink
                  href={`/categories/${c.handle}`}
                  className="hover:text-black transition-colors"
                >
                  <span>{c.name}</span>
                </LocalizedLink>
              </span>
            ))}
          </div>
        )}
      </div>
      <h1 className="text-md md:text-xl mb-2">{product.title}</h1>
    </>
  )
}

export default ProductInfo
