// TODO: Review this component.

"use client"

import * as React from "react"
import { twJoin, twMerge } from "tailwind-merge"
import { EmblaCarouselType } from "embla-carousel"
import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"
import { Icon } from "@/components/Icon"
import { IconCircle } from "@/components/IconCircle"

type GalleryThumbnail = {
  id: string
  url: string
  alt: string
}

export const ProductPageGallery: React.FC<
  React.ComponentPropsWithRef<"div"> & {
    selectedIndex?: number
    thumbnails?: GalleryThumbnail[]
  }
> = ({
  children,
  className,
  selectedIndex: controlledSelectedIndex,
  thumbnails = [],
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    containScroll: "trimSnaps",
    skipSnaps: true,
  })
  const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(true)

  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const scrollPrev = React.useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  )
  const scrollNext = React.useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  )
  const onSelect = React.useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [])
  const onThumbnailClick = React.useCallback(
    (index: number) => {
      if (!emblaApi) return
      emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  React.useEffect(() => {
    if (!emblaApi) return

    onSelect(emblaApi)
    emblaApi.on("reInit", onSelect).on("select", onSelect)
  }, [emblaApi, onSelect])

  React.useEffect(() => {
    if (!emblaApi || controlledSelectedIndex === undefined) return

    emblaApi.scrollTo(controlledSelectedIndex)
  }, [controlledSelectedIndex, emblaApi])

  const renderThumbnails = (orientation: "horizontal" | "vertical") => {
    if (!thumbnails.length) {
      return null
    }

    return (
      <div
        className={twMerge(
          orientation === "vertical"
            ? "hidden md:flex md:w-20 md:shrink-0 md:flex-col md:gap-3 md:overflow-y-auto"
            : "mt-3 flex gap-3 overflow-x-auto pb-1 md:hidden"
        )}
      >
        {thumbnails.map((thumbnail, index) => (
          <button
            key={thumbnail.id}
            type="button"
            onClick={() => onThumbnailClick(index)}
            aria-label={`View image ${index + 1}`}
            aria-current={index === selectedIndex ? "true" : undefined}
            className={twMerge(
              "relative shrink-0 overflow-hidden border transition-colors",
              orientation === "vertical" ? "h-30 w-20" : "h-24 w-18",
              index === selectedIndex
                ? "border-black"
                : "border-transparent opacity-60 hover:border-grayscale-300 hover:opacity-100"
            )}
          >
            <Image
              src={thumbnail.url}
              alt={thumbnail.alt}
              fill
              sizes={orientation === "vertical" ? "80px" : "72px"}
              className="object-cover"
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={twMerge("relative overflow-hidden", className)}>
      <div className="md:flex md:items-start md:gap-5">
        {renderThumbnails("vertical")}
        <div className="relative min-w-0 flex-1">
          <div className="relative flex items-center p-0">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={prevBtnDisabled}
              className="transition-opacity absolute left-4 z-10 max-lg:hidden"
              aria-label="Previous"
            >
              <IconCircle
                className={twJoin(
                  "bg-black text-white transition-colors",
                  prevBtnDisabled && "bg-transparent text-black"
                )}
              >
                <Icon name="arrow-left" className="w-6 h-6" />
              </IconCircle>
            </button>
            <div ref={emblaRef} className="w-full overflow-hidden">
              <div className="flex touch-pan-y">
                {React.Children.map(children, (child) => {
                  return <div className="w-full flex-shrink-0">{child}</div>
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={scrollNext}
              disabled={nextBtnDisabled}
              className="transition-opacity absolute right-4 z-10 max-lg:hidden"
              aria-label="Next"
            >
              <IconCircle
                className={twJoin(
                  "bg-black text-white transition-colors",
                  nextBtnDisabled && "bg-transparent text-black"
                )}
              >
                <Icon name="arrow-right" className="w-6 h-6" />
              </IconCircle>
            </button>
          </div>
          {renderThumbnails("horizontal")}
        </div>
      </div>
    </div>
  )
}
