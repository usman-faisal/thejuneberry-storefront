"use client"

import React, { Suspense } from "react"
import { HttpTypes } from "@medusajs/types"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductInfo from "@modules/products/templates/product-info"

type ProductGalleryActionsProps = {
  product: HttpTypes.StoreProduct
  materials: {
    id: string
    name: string
    colors: {
      id: string
      name: string
      hex_code: string
    }[]
  }[]
  region: HttpTypes.StoreRegion
  hasImages: boolean
  images: HttpTypes.StoreProductImage[]
}

const normalizeOptionValue = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

const getImageText = (image: HttpTypes.StoreProductImage) => {
  const metadata = image.metadata ?? {}
  const metadataText = [
    metadata.color,
    metadata.option_color,
    metadata.selected_color,
    metadata.color_name,
    metadata.option,
    metadata.title,
    metadata.alt,
    metadata.name,
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")

  return `${metadataText} ${image.url}`
}

const getSelectedOptionImageUrl = ({
  color,
  images,
  product,
}: {
  color?: string
  images: HttpTypes.StoreProductImage[]
  product: HttpTypes.StoreProduct
}) => {
  if (!color) {
    return undefined
  }

  const normalizedColor = normalizeOptionValue(color)
  const matchedImage = images.find((image) =>
    normalizeOptionValue(getImageText(image)).includes(normalizedColor)
  )

  if (matchedImage) {
    return matchedImage.url
  }

  const colorOption = product.options?.find(
    (option) => option.title?.trim().toLowerCase() === "color"
  )
  const colorIndex = colorOption?.values?.findIndex(
    (value) => normalizeOptionValue(value.value) === normalizedColor
  )

  if (colorIndex !== undefined && colorIndex > -1) {
    return images[colorIndex]?.url
  }

  return undefined
}

const ProductGalleryActions = ({
  product,
  materials,
  region,
  hasImages,
  images,
}: ProductGalleryActionsProps) => {
  const [selectedColor, setSelectedColor] = React.useState<string>()
  const selectedImageUrl = getSelectedOptionImageUrl({
    color: selectedColor,
    images,
    product,
  })

  return (
    <>
      <ImageGallery
        className="md:hidden"
        images={images}
        selectedImageUrl={selectedImageUrl}
      />
      <div className="flex max-lg:flex-col gap-8 xl:gap-27">
        {hasImages && (
          <div className="lg:w-1/2 flex flex-1 flex-col gap-8">
            <ImageGallery
              className="max-md:hidden"
              images={images}
              selectedImageUrl={selectedImageUrl}
            />
          </div>
        )}
        <div className="sticky flex-1 top-0">
          <ProductInfo product={product} />
          <Suspense>
            <ProductActions
              product={product}
              materials={materials}
              region={region}
              selectedOptionImageUrl={selectedImageUrl}
              onSelectedColorChange={setSelectedColor}
            />
          </Suspense>
        </div>
        {!hasImages && <div className="flex-1" />}
      </div>
    </>
  )
}

export default ProductGalleryActions
