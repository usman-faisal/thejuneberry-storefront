import { Metadata } from "next"
import Image from "next/image"
import { getRegion } from "@lib/data/regions"
import { getProductsList } from "@lib/data/products"
import { Layout, LayoutColumn } from "@/components/Layout"
import { LocalizedLink } from "@/components/LocalizedLink"
import ProductPreview from "@modules/products/components/product-preview"
import { Icon } from "@/components/Icon"

export const metadata: Metadata = {
  title: "The Juneberry",
  description:
    "Premium Pakistani women's clothing — lawn, taftan, chiffon and more",
}

const TrustStrip: React.FC = () => {
  return (
    <div className="border-b border-grayscale-100">
      <Layout>
        <LayoutColumn>
          <div className="flex flex-col md:flex-row items-center justify-center divide-y md:divide-y-0 md:divide-x divide-grayscale-100">
            <div className="flex items-center gap-3 py-5 px-8 md:py-6 w-full md:w-auto md:flex-1 justify-center">
              <Icon
                name="truck"
                className="w-4 h-4 text-grayscale-500 shrink-0"
              />
              <span className="text-xs tracking-widest uppercase text-grayscale-600">
                Nationwide Delivery
              </span>
            </div>
            <div className="flex items-center gap-3 py-5 px-8 md:py-6 w-full md:w-auto md:flex-1 justify-center">
              <Icon
                name="package"
                className="w-4 h-4 text-grayscale-500 shrink-0"
              />
              <span className="text-xs tracking-widest uppercase text-grayscale-600">
                Premium Quality Fabrics
              </span>
            </div>

            <div className="flex items-center gap-3 py-5 px-8 md:py-6 w-full md:w-auto md:flex-1 justify-center">
              <Icon
                name="heart"
                className="w-4 h-4 text-grayscale-500 shrink-0"
              />
              <span className="text-xs tracking-widest uppercase text-grayscale-600">
                Loved by Thousands
              </span>
            </div>
          </div>
        </LayoutColumn>
      </Layout>
    </div>
  )
}


const NewArrivalsSection: React.FC<{ countryCode: string }> = async ({
  countryCode,
}) => {
  const {
    response: { products },
  } = await getProductsList({
    pageParam: 1,
    queryParams: { limit: 8, handle: 'new-arrivals' },
    countryCode,
  })

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="py-20 md:py-32">
      <Layout>
        <LayoutColumn>
          <div className="flex justify-between items-baseline mb-12 md:mb-16">
            <h2 className="text-base md:text-md font-medium tracking-widest uppercase">
              New Arrivals
            </h2>
            <LocalizedLink
              href="/store"
              className="text-xs tracking-widest uppercase text-grayscale-500 hover:text-black transition-colors"
            >
              View All
            </LocalizedLink>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-12 md:gap-x-8 md:gap-y-16">
            {products.map((product) => (
              <ProductPreview key={product.id} product={product} />
            ))}
          </div>
        </LayoutColumn>
      </Layout>
    </section>
  )
}

const AboutBlurb: React.FC = () => {
  return (
    <section className="py-20 md:py-32 border-t border-grayscale-100">
      <Layout>
        <LayoutColumn start={{ base: 1, md: 3 }} end={{ base: 13, md: 11 }}>
          <div className="flex flex-col items-center text-center gap-6 md:gap-8">
            <h2 className="text-base md:text-md font-medium tracking-widest uppercase">
              Our Story
            </h2>
            <p className="text-xs md:text-base text-grayscale-500 leading-loose max-w-prose">
              The Juneberry was born from a love of fine fabric and timeless
              silhouettes. We craft premium lawn —
              each piece thoughtfully designed for the modern Pakistani woman who
              wears her elegance effortlessly.
            </p>
            <LocalizedLink
              href="/store"
              className="text-xs tracking-widest uppercase border-b border-black pb-0.5 hover:text-grayscale-600 hover:border-grayscale-600 transition-colors"
            >
              Shop Now
            </LocalizedLink>
          </div>
        </LayoutColumn>
      </Layout>
    </section>
  )
}

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

  return (
    <>
      {/* Hero */}
      <div className="relative max-md:pt-18 w-full">
        <Image
          src="/images/content/juneberry_hero.png"
          width={2880}
          height={1500}
          alt="The Juneberry — Premium Pakistani women's clothing"
          className="w-full md:h-screen md:object-cover"
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

      {/* Trust Strip */}
      <TrustStrip />

      {/* New Arrivals */}
      <NewArrivalsSection countryCode={countryCode} />

      {/* About */}
      <AboutBlurb />
    </>
  )
}
