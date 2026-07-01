import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { getCollectionsList } from "@lib/data/collections"
import { getProductsListWithSort } from "@lib/data/products"
import { isProductSoldOut } from "@lib/util/inventory"
import { Layout, LayoutColumn } from "@/components/Layout"
import { LocalizedButtonLink, LocalizedLink } from "@/components/LocalizedLink"
import { SocialLinks } from "@/components/SocialLinks"
import ProductPreview from "@modules/products/components/product-preview"

const WHATSAPP_URL =
  "https://wa.me/923313365411?text=Hi%20Juneberry%2C%20I%20need%20help%20choosing%20a%20design."

const trustPoints = [
  {
    title: "Cash on Delivery",
    description: "Pay when your order arrives.",
    marker: "01",
  },
  {
    title: "WhatsApp Ordering",
    description: "Quick help before you buy.",
    marker: "02",
  },
  {
    title: "Pakistan-wide Delivery",
    description: "Delivered across Pakistan.",
    marker: "03",
  },
  {
    title: "Premium Lawn Prints",
    description: "Soft fabrics and elegant designs.",
    marker: "04",
  },
]

const getCollectionImage = (collection: HttpTypes.StoreCollection) => {
  const image = collection.metadata?.image

  return typeof image === "object" &&
    image &&
    "url" in image &&
    typeof image.url === "string"
    ? image.url
    : null
}

const getCollectionDescription = (collection: HttpTypes.StoreCollection) => {
  if (typeof collection.metadata?.description === "string") {
    return collection.metadata.description
  }

  return null
}

const hasProductImage = (product: HttpTypes.StoreProduct) => {
  return Boolean(
    product.thumbnail || product.images?.some((image) => image.url)
  )
}

const isHomepageProduct = (product: HttpTypes.StoreProduct) => {
  return hasProductImage(product) && !isProductSoldOut(product)
}

const ProductGridPreview = ({
  products,
}: {
  products?: HttpTypes.StoreProduct[]
}) => {
  if (!products?.length) {
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-8">
      {products.map((product) => (
        <ProductPreview key={product.id} product={product} />
      ))}
    </div>
  )
}

export default async function HomeTemplate({
  countryCode,
}: {
  countryCode: string
}) {
  const [collectionsResult, arrivalsResult] = await Promise.all([
    getCollectionsList(0, 3, ["id", "title", "handle", "metadata"]),
    getProductsListWithSort({
      countryCode,
      sortBy: "created_at",
      queryParams: {
        limit: 100,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,+metadata,+collection.*,+images.*",
      },
    }),
  ])

  const collections = collectionsResult.collections
  const arrivals = arrivalsResult.response.products
    .filter(isHomepageProduct)
    .slice(0, 8)
  const realLifeCollections = collections.filter(getCollectionImage).slice(0, 3)

  return (
    <main>
      <h1 className="sr-only">
        The Juneberry | Premium Lawn Collections for Every Occasion
      </h1>

      <section className="relative min-h-[500px] overflow-hidden md:min-h-[620px]">
        <Image
          src="/images/content/juneberry_hero.png"
          alt="The Juneberry premium lawn collection"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-white/10" />
        <Layout className="relative min-h-[500px] content-end pb-10 pt-32 md:min-h-[620px] md:pb-16">
          <LayoutColumn className="col-span-12 md:col-span-8 lg:col-span-7">
            <div className="max-w-200 text-black">
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-grayscale-700">
                The Juneberry
              </p>
              <h2 className="mb-4 text-lg text-[#222] md:text-2xl">
                Premium Lawn Collections for Every Occasion
              </h2>
              <p className="mb-8 max-w-120 text-sm text-[#666] md:text-base">
                Elegant prints, soft fabric, and ready-to-order designs.
              </p>
              <div className="flex flex-col gap-3 xs:flex-row">
                <LocalizedButtonLink href="#new-arrivals" size="md">
                  Shop New Arrivals
                </LocalizedButtonLink>
                <LocalizedButtonLink
                  href="#collections"
                  size="md"
                  variant="outline"
                  className="border-black bg-white text-black hover:border-black hover:text-grayscale-600"
                >
                  View Collections
                </LocalizedButtonLink>
              </div>
            </div>
          </LayoutColumn>
        </Layout>
      </section>

      {collections.length > 0 && (
        <section id="collections" className="py-12 md:py-18">
          <Layout className="gap-y-6">
            <LayoutColumn className="col-span-12">
              <h2 className="text-md md:text-lg">Shop by Collection</h2>
            </LayoutColumn>
            {collections.map((collection) => {
              const image = getCollectionImage(collection)
              const description = getCollectionDescription(collection)

              return (
                <LayoutColumn
                  key={collection.id}
                  className="col-span-12 md:col-span-4"
                >
                  <div className="h-full">
                    <LocalizedLink href={`/collections/${collection.handle}`}>
                      <div className="relative mb-5 aspect-[4/5] overflow-hidden bg-grayscale-50">
                        {image ? (
                          <Image
                            src={image}
                            alt={collection.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover object-center transition-transform duration-500 hover:scale-[1.02]"
                          />
                        ) : null}
                      </div>
                      <h3 className="mb-2 text-sm md:text-md">
                        {collection.title}
                      </h3>
                      {description && (
                        <p className="mb-5 text-xs text-grayscale-600 md:text-sm">
                          {description}
                        </p>
                      )}
                    </LocalizedLink>
                    <LocalizedButtonLink
                      href={`/collections/${collection.handle}`}
                      size="sm"
                      variant="outline"
                    >
                      View Collection
                    </LocalizedButtonLink>
                  </div>
                </LayoutColumn>
              )
            })}
          </Layout>
        </section>
      )}

      {arrivals.length > 0 && (
        <section id="new-arrivals" className="py-12 md:py-18">
          <Layout className="gap-y-8">
            <LayoutColumn className="col-span-12 flex items-center justify-between gap-4">
              <h2 className="text-md md:text-lg">New Arrivals</h2>
              <LocalizedButtonLink href="/store" size="sm" variant="link">
                View all
              </LocalizedButtonLink>
            </LayoutColumn>
            <LayoutColumn className="col-span-12">
              <ProductGridPreview products={arrivals} />
            </LayoutColumn>
          </Layout>
        </section>
      )}

      <section className="bg-grayscale-30 py-12 md:py-16">
        <Layout className="gap-y-6">
          <LayoutColumn className="col-span-12 md:col-span-5 lg:col-span-4">
            <h2 className="text-sm md:text-md">Why shop from Juneberry?</h2>
            <p className="mt-3 text-xs text-grayscale-700 md:text-sm">
              Simple ordering, reliable delivery, and designs selected for
              everyday elegance.
            </p>
          </LayoutColumn>
          <LayoutColumn className="col-span-12 md:col-span-7 lg:col-span-8">
            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 md:gap-4">
              {trustPoints.map((point) => (
                <div
                  key={point.title}
                  className="flex min-h-28 items-start gap-4 border border-grayscale-200 bg-white p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-grayscale-200 text-2xs text-grayscale-600">
                    {point.marker}
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm">{point.title}</h3>
                    <p className="text-xs text-grayscale-600">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </LayoutColumn>
        </Layout>
      </section>

      {realLifeCollections.length > 0 && (
        <section className="py-12 md:py-18">
          <Layout className="gap-y-8">
            <LayoutColumn className="col-span-12 flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
              <div>
                <h2 className="text-md md:text-lg">Styled by Juneberry</h2>
                <p className="mt-2 text-xs text-grayscale-600 md:text-sm">
                  A closer look at our collections in real settings.
                </p>
              </div>
              <SocialLinks className="gap-4 text-black" />
            </LayoutColumn>
            {realLifeCollections.map((collection) => {
              const image = getCollectionImage(collection)

              return image ? (
                <LayoutColumn
                  key={collection.id}
                  className="col-span-12 md:col-span-4"
                >
                  <LocalizedLink href={`/collections/${collection.handle}`}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-grayscale-50">
                      <Image
                        src={image}
                        alt={`${collection.title} lifestyle photo`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-center"
                      />
                    </div>
                  </LocalizedLink>
                </LayoutColumn>
              ) : null
            })}
          </Layout>
        </section>
      )}

      <section className="py-12 md:py-18">
        <Layout>
          <LayoutColumn className="col-span-12 border-t border-grayscale-200 pt-10 text-center">
            <h2 className="mb-3 text-md md:text-lg">
              Need help choosing a design?
            </h2>
            <p className="mx-auto mb-6 max-w-150 text-sm text-grayscale-700">
              Message us on WhatsApp and we&apos;ll help you pick the right
              piece.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-xs bg-black px-6 text-white transition-colors hover:bg-grayscale-500"
            >
              Chat on WhatsApp
            </a>
          </LayoutColumn>
        </Layout>
      </section>
    </main>
  )
}
