import { ProductPageGallery } from "@/components/ProductPageGallery"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  className?: string
  selectedImageUrl?: string
}

const ImageGallery = ({ images, className, selectedImageUrl }: ImageGalleryProps) => {
  const filteredImages = images.filter((image) => Boolean(image.url))
  const selectedIndex = selectedImageUrl
    ? filteredImages.findIndex((image) => image.url === selectedImageUrl)
    : undefined

  if (!filteredImages.length) {
    return null
  }

  return (
    <ProductPageGallery
      className={className}
      selectedIndex={selectedIndex !== undefined && selectedIndex > -1 ? selectedIndex : undefined}
    >
      {filteredImages.map((image, index) => (
        <div
          key={image.id}
          className="relative aspect-[3/4] w-full overflow-hidden"
        >
          <Image
            key={image.id}
            src={image.url}
            priority={index <= 2 ? true : false}
            alt={`Product image ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 589px, (max-width: 1279px) 384px, 456px"
            className="object-cover"
          />
        </div>
      ))}
    </ProductPageGallery>
  )
}

export default ImageGallery
