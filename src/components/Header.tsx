import * as React from "react"
import Image from "next/image"
import { listRegions } from "@lib/data/regions"
import { getCollectionsList } from "@lib/data/collections"
import { SearchField } from "@/components/SearchField"
import { Layout, LayoutColumn } from "@/components/Layout"
import { LocalizedLink } from "@/components/LocalizedLink"
import { HeaderDrawer } from "@/components/HeaderDrawer"
import { RegionSwitcher } from "@/components/RegionSwitcher"
import { HeaderWrapper } from "@/components/HeaderWrapper"

import dynamic from "next/dynamic"

const LoginLink = dynamic(
  () => import("@modules/header/components/LoginLink"),
  { loading: () => <></> }
)

const CartDrawer = dynamic(
  () => import("@/components/CartDrawer").then((mod) => mod.CartDrawer),
  { loading: () => <></> }
)

export const Header: React.FC = async () => {
  const regions = await listRegions()
  const { collections = [] } = await getCollectionsList(0, 100)

  const countryOptions = regions
    .map((r) => {
      return (r.countries ?? [])
        .filter((c) => c.iso_2 === "pk")
        .map((c) => ({
          country: c.iso_2,
          region: r.id,
          label: c.display_name,
        }))
    })
    .flat()
    .sort((a, b) => (a?.label ?? "").localeCompare(b?.label ?? ""))

  return (
    <>
      <HeaderWrapper>
        <Layout>
          <LayoutColumn>
            <div className="flex justify-between items-center h-18 md:h-21">
              <div className="font-medium text-md flex items-center">
                <LocalizedLink href="/" className="block">
                  <Image
                    src="/images/content/logo.jpg"
                    width={150}
                    height={50}
                    alt="The Juneberry"
                    className="h-10 w-auto object-contain"
                    priority
                  />
                </LocalizedLink>
              </div>
              <div className="flex items-center gap-8 max-md:hidden">
                <LocalizedLink href="/">Shop</LocalizedLink>
                {collections.map((collection) => (
                  <LocalizedLink
                    key={collection.id}
                    href={`/collections/${collection.handle}`}
                  >
                    {collection.title}
                  </LocalizedLink>
                ))}
              </div>
              <div className="flex items-center gap-3 lg:gap-6 max-md:hidden">
                <RegionSwitcher
                  countryOptions={countryOptions}
                  className="w-16"
                  selectButtonClassName="h-auto !gap-0 !p-1 transition-none"
                  selectIconClassName="text-current"
                />
                <React.Suspense>
                  <SearchField countryOptions={countryOptions} />
                </React.Suspense>
                <LoginLink className="p-1 group-data-[light=true]:md:text-white group-data-[sticky=true]:md:text-black" />
                <CartDrawer />
              </div>
              <div className="flex items-center gap-4 md:hidden">
                <LoginLink className="p-1 group-data-[light=true]:md:text-white" />
                <CartDrawer />
                <React.Suspense>
                  <HeaderDrawer
                    countryOptions={countryOptions}
                    collections={collections.map((c) => ({
                      id: c.id,
                      handle: c.handle,
                      title: c.title,
                    }))}
                  />
                </React.Suspense>
              </div>
            </div>
          </LayoutColumn>
        </Layout>
      </HeaderWrapper>
    </>
  )
}

