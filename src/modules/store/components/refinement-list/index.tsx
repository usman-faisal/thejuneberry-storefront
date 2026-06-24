"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import { Layout, LayoutColumn } from "@/components/Layout"
import { CategoryFilter } from "@modules/store/components/refinement-list/category-filter"
import { CollectionFilter } from "@modules/store/components/refinement-list/collection-filter"
import { MobileFilters } from "@modules/store/components/refinement-list/mobile-filters"
import { MobileSort } from "@modules/store/components/refinement-list/mobile-sort"
import SortProducts, {
  SortOptions,
} from "@modules/store/components/refinement-list/sort-products"

type RefinementListProps = {
  title?: string
  collections?: Record<string, string>
  collection?: string[]
  categories?: Record<string, string>
  category?: string[]
  types?: Record<string, string>
  type?: string[]
  sortBy: SortOptions | undefined
  "data-testid"?: string
}

const RefinementList = ({
  title = "Shop",
  collections,
  collection,
  categories,
  category,
  types,
  type,
  sortBy,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setQueryParams = useCallback(
    (name: string, value: string | string[]) => {
      const query = new URLSearchParams(searchParams)

      if (Array.isArray(value)) {
        query.delete(name)
        value.forEach((v) => query.append(name, v))
      } else {
        query.set(name, value)
      }

      router.push(`${pathname}?${query.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const setMultipleQueryParams = useCallback(
    (params: Record<string, string | string[]>) => {
      const query = new URLSearchParams(searchParams)

      Object.entries(params).forEach(([name, value]) => {
        if (Array.isArray(value)) {
          query.delete(name)
          value.forEach((v) => query.append(name, v))
        } else {
          query.set(name, value)
        }
      })

      router.push(`${pathname}?${query.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router]
  )

  return (
    <Layout className="mb-6 md:mb-8">
      <LayoutColumn>
        <div className="flex justify-between items-center gap-4 py-4 border-b border-grayscale-200">
          {title && title !== "Shop" ? (
            <h1 className="text-sm md:text-base font-medium tracking-widest uppercase text-grayscale-700" id="products">
              {title}
            </h1>
          ) : (
            <span className="text-sm font-medium tracking-widest uppercase text-grayscale-500">All Products</span>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <MobileFilters
              collections={collections}
              collection={collection}
              categories={categories}
              category={category}
              types={types}
              type={type}
              setMultipleQueryParams={setMultipleQueryParams}
            />
            <MobileSort sortBy={sortBy} setQueryParams={setQueryParams} />
            <div className="flex items-center gap-3 max-md:hidden">
              {typeof collections !== "undefined" && (
                <CollectionFilter
                  collections={collections}
                  collection={collection}
                  setQueryParams={setQueryParams}
                />
              )}
              {typeof categories !== "undefined" && (
                <CategoryFilter
                  categories={categories}
                  category={category}
                  setQueryParams={setQueryParams}
                />
              )}
              {/*{typeof types !== "undefined" && (
                <TypeFilter
                  types={types}
                  type={type}
                  setQueryParams={setQueryParams}
                />
              )}*/}
            </div>
            <SortProducts
              sortBy={sortBy}
              setQueryParams={setQueryParams}
              data-testid={dataTestId}
            />
          </div>
        </div>
      </LayoutColumn>
    </Layout>
  )
}

export default RefinementList
