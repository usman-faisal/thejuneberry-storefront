import { Metadata } from "next"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: {
    absolute: "The Juneberry | High-Quality Designer Replicas & Master Copies",
  },
  description:
    "Discover premium master copies and 1st copy replicas of top Pakistani designer brands. Shop our collection of Khaadi, Ethnic, and Afrozah replicas at unbeatable prices.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    collection?: string | string[]
    category?: string | string[]
    type?: string | string[]
    page?: string
  }>
  params: Promise<{ countryCode: string }>
}

export default async function Home({ searchParams, params }: Params) {
  const { countryCode } = await params
  const { sortBy, page, collection, category, type } = await searchParams

  return (
    <>
      <h1 className="sr-only">The Juneberry | Premium Pakistani Designer Replicas & Master Copies</h1>
      <StoreTemplate
        sortBy={sortBy}
        page={page}
        countryCode={countryCode}
        collection={
          !collection
            ? undefined
            : Array.isArray(collection)
              ? collection
              : [collection]
        }
        category={
          !category ? undefined : Array.isArray(category) ? category : [category]
        }
        type={!type ? undefined : Array.isArray(type) ? type : [type]}
      />
    </>
  )
}
