"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import * as ReactAria from "react-aria-components"
import {
  getProductItemsInStock,
  getVariantItemsInStock,
} from "@lib/util/inventory"
import { Button } from "@/components/Button"
import { InputNumberField } from "@/components/InputNumberField"
import {
  UiSelectButton,
  UiSelectIcon,
  UiSelectListBox,
  UiSelectListBoxItem,
  UiSelectValue,
} from "@/components/ui/Select"
import { useCountryCode } from "hooks/country-code"
import ProductPrice from "@modules/products/components/product-price"
import { getProductPrice } from "@lib/util/get-product-price"
import { UiRadioGroup } from "@/components/ui/Radio"
import { withReactQueryProvider } from "@lib/util/react-query"
import { useAddLineItem } from "hooks/cart"
import { UiDialogTrigger, UiDialog, UiCloseButton } from "@/components/Dialog"
import { UiModalOverlay, UiModal } from "@/components/ui/Modal"
import { Icon } from "@/components/Icon"
import { useRouter, useSearchParams } from "next/navigation"
import type { SelectedLineItemOption } from "@lib/util/line-item-options"

const WHATSAPP_NUMBER = "923313365411"

type ProductActionsProps = {
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
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) {
      acc[varopt.option_id] = varopt.value
    }
    return acc
  }, {})
}

const priorityOptions = ["material", "color", "size"]

const normalizeOptionKey = (key: string) =>
  key.trim().toLowerCase().replace(/\s+/g, "_")

const normalizeOptionTitle = (title: string | null | undefined) =>
  title?.trim().toLowerCase() ?? ""

const getInitialOptions = (product: ProductActionsProps["product"]) => {
  if (product.variants?.length === 1) {
    const variantOptions = optionsAsKeymap(product.variants[0].options)
    return variantOptions ?? {}
  }

  if (product.options) {
    const singleOptionValues = product.options
      .filter((option) => option.values)
      .filter((option) => option.values!.length === 1)
      .reduce(
        (acc, option) => {
          acc[option.id] = option.values![0].value
          return acc
        },
        {} as Record<string, string>
      )

    return singleOptionValues
  }

  return null
}

const getSelectedLineItemOptions = (
  productOptions: NonNullable<ProductActionsProps["product"]["options"]>,
  selectedOptions: Record<string, string | undefined>
): SelectedLineItemOption[] => {
  return productOptions
    .map((option) => {
      const value = selectedOptions[option.id]

      if (!option.title || !value) {
        return null
      }

      return {
        title: option.title,
        value,
      }
    })
    .filter((option): option is SelectedLineItemOption => Boolean(option))
}

// ─── Cart Notification ───────────────────────────────────────────────────────

type CartNotificationProps = {
  productTitle: string
  productThumbnail?: string | null
  countryCode: string
  onDismiss: () => void
}

function CartNotification({
  productTitle,
  productThumbnail,
  countryCode,
  onDismiss,
}: CartNotificationProps) {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [exiting, setExiting] = useState(false)

  const dismiss = () => {
    setExiting(true)
    setTimeout(() => {
      onDismiss()
    }, 320)
  }

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      dismiss()
    }, 6000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        top: "calc(var(--header-height, 72px) + 16px)",
        right: "16px",
        zIndex: 9999,
        width: "min(380px, calc(100vw - 32px))",
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        boxShadow: "0 8px 40px rgba(0,0,0,0.13)",
        borderRadius: "4px",
        padding: "20px",
        animation: exiting
          ? "slideOutRight 0.32s cubic-bezier(0.4,0,1,1) forwards"
          : "slideInRight 0.38s cubic-bezier(0,0,0.2,1) forwards",
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(110%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(110%); }
        }
      `}</style>

      {/* Close */}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          color: "#888",
          lineHeight: 1,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        {/* Check icon */}
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "#000",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p style={{ fontSize: "13px", fontWeight: 500, margin: 0, lineHeight: 1.4 }}>
          Added to cart
        </p>
      </div>

      {/* Product row */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
        {productThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={productThumbnail}
            alt={productTitle}
            style={{
              width: "56px",
              height: "56px",
              objectFit: "cover",
              borderRadius: "2px",
              background: "#f5f5f5",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "#f5f5f5",
              borderRadius: "2px",
              flexShrink: 0,
            }}
          />
        )}
        <p
          style={{
            fontSize: "13px",
            color: "#222",
            margin: 0,
            lineHeight: 1.4,
            fontWeight: 400,
          }}
        >
          {productTitle}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button
          onClick={() => {
            dismiss()
            router.push(`/${countryCode}/checkout`)
          }}
          style={{
            width: "100%",
            padding: "10px 16px",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "2px",
            fontSize: "12px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 500,
            cursor: "pointer",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Checkout
        </button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <button
            onClick={() => {
              dismiss()
              router.push(`/${countryCode}/cart`)
            }}
            style={{
              padding: "9px 12px",
              background: "transparent",
              color: "#000",
              border: "1px solid #000",
              borderRadius: "2px",
              fontSize: "11px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#000"
              e.currentTarget.style.color = "#fff"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.color = "#000"
            }}
          >
            View Cart
          </button>
          <button
            onClick={dismiss}
            style={{
              padding: "9px 12px",
              background: "transparent",
              color: "#666",
              border: "1px solid #e5e5e5",
              borderRadius: "2px",
              fontSize: "11px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 500,
              cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#999"
              e.currentTarget.style.color = "#333"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e5e5"
              e.currentTarget.style.color = "#666"
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

function ProductActions({ product, materials, disabled }: ProductActionsProps) {
  const searchParams = useSearchParams()
  const [options, setOptions] = useState<Record<string, string | undefined>>(
    getInitialOptions(product) ?? {}
  )
  const [quantity, setQuantity] = useState(1)
  const countryCode = useCountryCode()
  const [showNotification, setShowNotification] = useState(false)
  const [whatsAppError, setWhatsAppError] = useState<string | null>(null)
  const viewContentFired = useRef(false)

  const { mutateAsync, isPending } = useAddLineItem()

  // Track ViewContent once when the product page loads
  useEffect(() => {
    if (viewContentFired.current) return
    if (typeof window === "undefined" || !window.fbq) return
    if (!product) return

    viewContentFired.current = true

    const { cheapestPrice } = getProductPrice({ product })
    const lowestVariantPrice = cheapestPrice?.calculated_price_number ?? 0

    window.fbq("track", "ViewContent", {
      value: lowestVariantPrice / 100,
      currency: "PKR",
      content_ids: [product.id],
      content_type: "product",
      content_name: product.title,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    const initialOptions = getInitialOptions(product)
    if (initialOptions) {
      setOptions(initialOptions)
    }
  }, [product])

  useEffect(() => {
    const optionEntries = Array.from(searchParams.entries()).filter(([key]) =>
      key.startsWith("mcp_opt_")
    )

    if (!optionEntries.length || !product.options?.length) {
      return
    }

    const requestedValues = optionEntries.reduce(
      (acc, [key, value]) => {
        const normalizedKey = normalizeOptionKey(key.replace(/^mcp_opt_/, ""))
        acc[normalizedKey] = value
        return acc
      },
      {} as Record<string, string>
    )

    const mappedOptions = (product.options ?? []).reduce(
      (acc, option) => {
        const optionIdKey = normalizeOptionKey(option.id)
        const optionTitleKey = normalizeOptionKey(option.title ?? "")
        const selectedValue =
          requestedValues[optionIdKey] ?? requestedValues[optionTitleKey]

        if (!selectedValue) {
          return acc
        }

        const allowedValues = new Set(
          (option.values ?? []).map((value) => value.value)
        )

        if (allowedValues.size && !allowedValues.has(selectedValue)) {
          return acc
        }

        acc[option.id] = selectedValue
        return acc
      },
      {} as Record<string, string>
    )

    if (!Object.keys(mappedOptions).length) {
      return
    }

    setOptions((prev) => ({
      ...prev,
      ...mappedOptions,
    }))
  }, [searchParams, product.options])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return Object.entries(variantOptions ?? {}).every(
        ([optionId, value]) => options[optionId] === value
      )
    })
  }, [product.variants, options])

  const getMatchingVariant = (
    selectedOptions: Record<string, string | undefined>
  ) => {
    return product.variants?.find((variant) => {
      const variantOptions = optionsAsKeymap(variant.options)
      return Object.entries(variantOptions ?? {}).every(
        ([optionId, value]) => selectedOptions[optionId] === value
      )
    })
  }

  const isOptionValueSoldOut = (optionId: string, value: string) => {
    const variant = getMatchingVariant({
      ...options,
      [optionId]: value,
    })

    return variant ? getVariantItemsInStock(variant) === 0 : false
  }

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
    setWhatsAppError(null)
  }

  const handleWhatsAppOrder = () => {
    const sizeOption = productOptions.find(
      (option) => normalizeOptionTitle(option.title) === "size"
    )
    const selectedSize = sizeOption ? options[sizeOption.id] : undefined

    if (sizeOption && !selectedSize) {
      setWhatsAppError("Please select a size first")
      return
    }

    setWhatsAppError(null)

    if (!selectedVariant) return

    const { variantPrice } = getProductPrice({
      product,
      variantId: selectedVariant.id,
    })

    const priceString = variantPrice
      ? (variantPrice.calculated_price.includes("Rs") || variantPrice.calculated_price.includes("PKR")
        ? variantPrice.calculated_price
        : `Rs. ${variantPrice.calculated_price_number}`)
      : ""
    const selectedOptionsText = selectedLineItemOptions.length
      ? `\n${selectedLineItemOptions
        .map((option) => `${option.title}: ${option.value}`)
        .join("\n")}`
      : ""

    // Track Lead event on WhatsApp order click
    if (typeof window !== "undefined" && window.fbq) {
      const variantPriceNumber = variantPrice?.calculated_price_number ?? 0
      window.fbq("track", "Lead", {
        value: variantPriceNumber / 100,
        currency: "PKR",
        content_ids: [selectedVariant.id],
        content_type: "product",
      })
    }

    const message = `Hi! I'd like to order:

Product: ${product.title}
Options:${selectedOptionsText || "\nN/A"}
Price: ${priceString}

Please confirm availability.`

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank")
  }

  // check if the selected variant is in stock
  const itemsInStock = selectedVariant
    ? getVariantItemsInStock(selectedVariant)
    : 0
  const productItemsInStock = getProductItemsInStock(product)
  const isSoldOut = productItemsInStock === 0

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    await mutateAsync({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
      metadata: selectedLineItemOptions.length
        ? { selected_options: selectedLineItemOptions }
        : undefined,
    })

    // Track AddToCart event
    if (typeof window !== "undefined" && window.fbq) {
      const { variantPrice } = getProductPrice({
        product,
        variantId: selectedVariant.id,
      })
      const variantPriceNumber = variantPrice?.calculated_price_number ?? 0
      window.fbq("track", "AddToCart", {
        value: variantPriceNumber / 100,
        currency: "PKR",
        content_ids: [selectedVariant.id],
        content_type: "product",
        content_name: product.title,
      })
    }

    setShowNotification(true)
  }

  const hasMultipleVariants = (product.variants?.length ?? 0) > 1
  const productOptions = (product.options || []).sort((a, b) => {
    let aPriority = priorityOptions.indexOf(normalizeOptionTitle(a.title))
    let bPriority = priorityOptions.indexOf(normalizeOptionTitle(b.title))

    if (aPriority === -1) {
      aPriority = priorityOptions.length
    }

    if (bPriority === -1) {
      bPriority = priorityOptions.length
    }

    return aPriority - bPriority
  })
  const selectedLineItemOptions = getSelectedLineItemOptions(
    productOptions,
    options
  )

  const materialOption = productOptions.find(
    (o) => normalizeOptionTitle(o.title) === "material"
  )
  const colorOption = productOptions.find(
    (o) => normalizeOptionTitle(o.title) === "color"
  )
  const otherOptions =
    materialOption && colorOption
      ? productOptions.filter(
        (o) => o.id !== materialOption.id && o.id !== colorOption.id
      )
      : productOptions

  const selectedMaterial =
    materialOption && options[materialOption.id]
      ? materials.find((m) => m.name === options[materialOption.id])
      : undefined

  useEffect(() => {
    const defaultOptions = productOptions.reduce(
      (acc, option) => {
        let defaultValue: string | undefined

        if (materialOption && option.id === materialOption.id) {
          defaultValue =
            materials[0]?.name ??
            option.values?.find((value) => Boolean(value.value))?.value
        } else if (colorOption && option.id === colorOption.id) {
          defaultValue =
            selectedMaterial?.colors[0]?.name ??
            option.values?.find((value) => Boolean(value.value))?.value
        } else {
          defaultValue = option.values?.find((value) =>
            Boolean(value.value)
          )?.value
        }

        if (defaultValue) {
          acc[option.id] = defaultValue
        }

        return acc
      },
      {} as Record<string, string>
    )

    if (!Object.keys(defaultOptions).length) {
      return
    }

    setOptions((prev) => {
      let next = prev

      Object.entries(defaultOptions).forEach(([optionId, value]) => {
        if (!next[optionId]) {
          next = next === prev ? { ...prev } : next
          next[optionId] = value
        }
      })

      return next
    })
  }, [colorOption, materialOption, materials, productOptions, selectedMaterial])

  const showOtherOptions =
    !materialOption ||
    !colorOption ||
    (selectedMaterial &&
      (selectedMaterial.colors.length < 2 || options[colorOption.id]))

  return (
    <>
      {showNotification && (
        <CartNotification
          productTitle={product.title ?? ""}
          productThumbnail={product.thumbnail}
          countryCode={countryCode ?? ""}
          onDismiss={() => setShowNotification(false)}
        />
      )}

      <ProductPrice product={product} variant={selectedVariant} />
      {isSoldOut && (
        <p className="mb-6 max-w-120 text-sm font-medium text-red-primary">
          This product is currently sold out.
        </p>
      )}
      <div className="max-md:text-xs mb-6 max-w-120">
        <p>{product.description}</p>
      </div>
      <div className="mb-8 md:mb-12">
        <UiDialogTrigger>
          <Button variant="unstyled" className="group inline-flex items-center gap-2 border border-grayscale-200 hover:border-black transition-colors px-4 py-2 text-xs tracking-widest uppercase font-medium text-grayscale-600 hover:text-black rounded-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 6H3" /><path d="M10 12H3" /><path d="M10 18H3" /><circle cx="17" cy="15" r="3" /><path d="m21 19-1.9-1.9" /></svg>
            Size Chart
          </Button>
          <UiModalOverlay>
            <UiModal className="max-w-2xl w-full p-0 overflow-y-auto">
              <UiDialog className="flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-grayscale-100">
                  <h3 className="text-sm font-semibold tracking-widest uppercase">Size Guide</h3>
                  <UiCloseButton variant="ghost" className="p-1 hover:bg-grayscale-50 rounded-sm">
                    <Icon name="close" className="w-5 h-5" />
                  </UiCloseButton>
                </div>
                {/* Chart Image */}
                <div className="p-6 flex justify-center items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/content/size_chart.png"
                    alt="Size Chart"
                    className="max-w-[900px] w-full h-auto block mx-auto object-contain"
                  />
                </div>
              </UiDialog>
            </UiModal>
          </UiModalOverlay>
        </UiDialogTrigger>
      </div>
      {hasMultipleVariants && (
        <div className="flex flex-col gap-8 md:gap-6">
          {materialOption && colorOption && (
            <>
              <div>
                <p className="mb-4">
                  Materials
                  {options[materialOption.id] && (
                    <span className="text-grayscale-500 ml-6">
                      {options[materialOption.id]}
                    </span>
                  )}
                </p>
                <ReactAria.Select
                  selectedKey={options[materialOption.id] ?? null}
                  onSelectionChange={(value) => {
                    setOptions({ [materialOption.id]: `${value}` })
                  }}
                  placeholder="Choose material"
                  className="w-full md:w-60"
                  isDisabled={!!disabled || isPending}
                  aria-label="Material"
                >
                  <UiSelectButton className="!h-12 px-4 gap-2 max-md:text-base">
                    <UiSelectValue />
                    <UiSelectIcon className="h-6 w-6" />
                  </UiSelectButton>
                  <ReactAria.Popover className="w-[--trigger-width]">
                    <UiSelectListBox>
                      {materials.map((material) => (
                        <UiSelectListBoxItem
                          key={material.id}
                          id={material.name}
                        >
                          {material.name}
                        </UiSelectListBoxItem>
                      ))}
                    </UiSelectListBox>
                  </ReactAria.Popover>
                </ReactAria.Select>
              </div>
              {selectedMaterial && (
                <div className="mb-6">
                  <p className="mb-4">
                    Colors
                    <span className="text-grayscale-500 ml-6">
                      {options[colorOption.id]}
                    </span>
                  </p>
                  <UiRadioGroup
                    value={options[colorOption.id] ?? null}
                    onChange={(value) => {
                      setOptionValue(colorOption.id, value)
                    }}
                    aria-label="Color"
                    className="flex gap-6"
                    isDisabled={!!disabled || isPending}
                  >
                    {selectedMaterial.colors.map((color) => (
                      <ReactAria.Radio
                        key={color.id}
                        value={color.name}
                        aria-label={color.name}
                        className="h-8 w-8 cursor-pointer relative before:transition-colors before:absolute before:content-[''] before:-bottom-2 before:left-0 before:w-full before:h-px data-[selected]:before:bg-black shadow-sm hover:shadow"
                        style={{ background: color.hex_code }}
                      />
                    ))}
                  </UiRadioGroup>
                </div>
              )}
            </>
          )}
          {showOtherOptions &&
            otherOptions.map((option) => {
              const optionValues = (option.values ?? []).filter((value) =>
                Boolean(value.value)
              )

              return (
                <div key={option.id}>
                  <p className="mb-4">
                    {option.title}
                    {options[option.id] && (
                      <span className="text-grayscale-500 ml-6">
                        {options[option.id]}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {optionValues.map((value) => {
                      const isSelected = options[option.id] === value.value
                      const isValueSoldOut = isOptionValueSoldOut(
                        option.id,
                        value.value
                      )

                      return (
                        <button
                          key={value.id}
                          type="button"
                          onClick={() => setOptionValue(option.id, value.value)}
                          disabled={!!disabled || isPending || isValueSoldOut}
                          aria-pressed={isSelected}
                          aria-label={`${option.title} ${value.value}${
                            isValueSoldOut ? " sold out" : ""
                          }`}
                          className={
                            `min-w-12 h-10 rounded-2xl border px-6 text-base font-medium transition-colors ` +
                            (isValueSoldOut
                              ? "border-grayscale-200 bg-grayscale-50 text-grayscale-400 line-through cursor-not-allowed"
                              : isSelected
                              ? "border-black bg-black text-white"
                              : "border-grayscale-200 bg-white text-black hover:border-black")
                          }
                        >
                          {value.value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </div>
      )}
      <div className="mt-4 items-stretch gap-4">
        <p className="mb-4">
          Quantity
        </p>
        <InputNumberField
          isDisabled={
            !itemsInStock || !selectedVariant || !!disabled || isPending
          }
          value={quantity}
          onChange={setQuantity}
          minValue={1}
          maxValue={itemsInStock}
          className="w-35 shrink-0 max-md:justify-center max-md:gap-2"
          aria-label="Quantity"
        />
      </div>
      <div className="flex mt-4">
        <Button
          onPress={handleAddToCart}
          isDisabled={!itemsInStock || !selectedVariant || !!disabled}
          isLoading={isPending}
          className="flex-1 min-w-0"
        >
          {!selectedVariant
            ? "Select variant"
            : !itemsInStock
              ? "Out of stock"
              : "Add to cart"}
        </Button>
      </div>
      {whatsAppError && (
        <p className="text-red-primary text-xs mt-2 font-medium">
          {whatsAppError}
        </p>
      )}
      <div className="mt-4">
        <button
          onClick={handleWhatsAppOrder}
          disabled={!!disabled}
          className="flex-1 w-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center gap-2 py-3 px-6 text-sm tracking-widest uppercase font-medium transition-colors rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-12"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.978L2 22l5.177-1.356a9.946 9.946 0 0 0 4.832 1.252h.005c5.505 0 9.989-4.479 9.99-9.986 0-2.67-1.037-5.18-2.92-7.065A9.925 9.925 0 0 0 12.012 2zm5.72 14.102c-.313.882-1.815 1.626-2.501 1.712-.613.077-1.42.138-2.287-.138-3.555-1.134-5.834-4.708-6.012-4.945-.178-.236-1.442-1.923-1.442-3.67 0-1.748.887-2.612 1.221-2.964.33-.353.729-.441.972-.441.243 0 .487.001.699.01.222.01.522-.083.816.621.3.717 1.026 2.502 1.114 2.68.089.177.148.383.03.621-.118.238-.178.383-.355.59-.177.206-.372.459-.53.616-.178.176-.364.368-.157.721.206.353.916 1.51 1.968 2.448 1.357 1.21 2.506 1.584 2.86 1.761.354.177.56.147.768-.089.206-.236.885-1.029 1.121-1.382.236-.353.471-.294.796-.176.324.118 2.062 1.029 2.416 1.206.354.177.59.265.679.412.088.147.088.853-.225 1.735z" />
          </svg>
          Order via WhatsApp
        </button>
      </div>
    </>
  )
}

export default withReactQueryProvider(ProductActions)
