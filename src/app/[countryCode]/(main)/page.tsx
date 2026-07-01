import { Metadata } from "next"
import HomeTemplate from "@modules/home/templates"

export const metadata: Metadata = {
  title: {
    absolute: "The Juneberry | Premium Lawn & Ready-to-Order Designs",
  },
  description:
    "Discover elegant lawn collections, soft fabrics, and ready-to-order designs from The Juneberry.",
}

type Params = {
  params: Promise<{ countryCode: string }>
}

export default async function Home({ params }: Params) {
  const { countryCode } = await params

  return <HomeTemplate countryCode={countryCode} />
}
