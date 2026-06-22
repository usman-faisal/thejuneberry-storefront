import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"
import { listRegions } from "@lib/data/regions"
import { getProductsList } from "@lib/data/products"
import { getCollectionsList } from "@lib/data/collections"
import { HttpTypes } from "@medusajs/types"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL()

  let regions: HttpTypes.StoreRegion[] = []
  try {
    const fetchedRegions = await listRegions()
    if (fetchedRegions) {
      regions = fetchedRegions
    }
  } catch (e) {
    console.error("Failed to list regions for sitemap", e)
  }

  // Extract all country codes
  const countryCodes: string[] = []
  regions.forEach((region) => {
    region.countries?.forEach((c) => {
      if (c.iso_2) {
        countryCodes.push(c.iso_2.toLowerCase())
      }
    })
  })

  // Fallback to default if no countries are registered
  if (countryCodes.length === 0) {
    countryCodes.push(process.env.NEXT_PUBLIC_DEFAULT_REGION || "us")
  }

  const routes: MetadataRoute.Sitemap = []

  for (const countryCode of countryCodes) {
    // 1. Static Store Routes
    routes.push({
      url: `${baseUrl}/${countryCode}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    })
    routes.push({
      url: `${baseUrl}/${countryCode}/store`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    })
    routes.push({
      url: `${baseUrl}/${countryCode}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    })
    routes.push({
      url: `${baseUrl}/${countryCode}/terms-of-use`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    })
    routes.push({
      url: `${baseUrl}/${countryCode}/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    })

    // 2. Dynamic Product Routes
    try {
      const { response: { products } } = await getProductsList({
        pageParam: 1,
        queryParams: { limit: 100 },
        countryCode,
      })

      products.forEach((product) => {
        if (product.handle) {
          routes.push({
            url: `${baseUrl}/${countryCode}/products/${product.handle}`,
            lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          })
        }
      })
    } catch (e) {
      console.error(`Failed to fetch products for sitemap in country ${countryCode}`, e)
    }

    // 3. Dynamic Collection Routes
    try {
      const { collections } = await getCollectionsList(0, 100, ["handle"])
      collections.forEach((collection) => {
        if (collection.handle) {
          routes.push({
            url: `${baseUrl}/${countryCode}/collections/${collection.handle}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
          })
        }
      })
    } catch (e) {
      console.error(`Failed to fetch collections for sitemap`, e)
    }
  }

  return routes
}
