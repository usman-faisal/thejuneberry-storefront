import { Metadata } from "next"
import Image from "next/image"
import { getRegion } from "@lib/data/regions"
import { getProductsList } from "@lib/data/products"
import { Layout, LayoutColumn } from "@/components/Layout"
import { LocalizedLink } from "@/components/LocalizedLink"
import ProductsGrid from "@modules/products/components/products-grid"

export const metadata: Metadata = {
  title: "The Juneberry",
  description:
    "Premium Pakistani women's clothing — lawn, taftan, chiffon and more",
}

const PAGE_SIZE = 8

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products, count },
    nextPage,
  } = await getProductsList({
    pageParam: 1,
    queryParams: { limit: PAGE_SIZE },
    countryCode,
  })

  return (
    <>
      {/* Hero — slightly reduced height */}
      <div className="relative max-md:pt-18 w-full">
        <Image
          src="/images/content/juneberry_hero.png"
          width={2880}
          height={1500}
          alt="The Juneberry — Premium Pakistani women's clothing"
          className="w-full md:h-[80vh] md:object-cover"
          priority
        />
        <div className="absolute inset-x-0 bottom-[12%] flex justify-center z-10">
          <LocalizedLink
            href="/shop"
            className="bg-[#3D2314] hover:bg-[#2C190E] text-white py-[12px] px-[36px] rounded-xs transition-colors text-center tracking-widest uppercase font-serif text-xs md:text-base font-medium"
          >
            Shop Now
          </LocalizedLink>
        </div>
      </div>

      {/* All Products */}
      <section className="py-20 md:py-32">
        <Layout>
          <LayoutColumn>
            <div className="flex justify-between items-baseline mb-12 md:mb-16">
              <h2 className="text-base md:text-md font-medium tracking-widest uppercase">
                All Products
              </h2>
              <span className="text-xs tracking-widest uppercase text-grayscale-500">
                {count} {count === 1 ? "piece" : "pieces"}
              </span>
            </div>
            <ProductsGrid
              initialProducts={products}
              initialCount={count}
              initialNextPage={nextPage}
              countryCode={countryCode}
              pageSize={PAGE_SIZE}
            />
          </LayoutColumn>
        </Layout>
      </section>
    </>
  )
}
