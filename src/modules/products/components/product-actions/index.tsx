"use client"

import { isEqual } from "lodash"
import { useEffect, useMemo, useRef, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import * as ReactAria from "react-aria-components"
import { getVariantItemsInStock } from "@lib/util/inventory"
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
import { UiRadioGroup } from "@/components/ui/Radio"
import { withReactQueryProvider } from "@lib/util/react-query"
import { useAddLineItem } from "hooks/cart"
import { UiDialogTrigger, UiDialog, UiCloseButton } from "@/components/Dialog"
import { UiModalOverlay, UiModal } from "@/components/ui/Modal"
import { Icon } from "@/components/Icon"
import { useRouter, useSearchParams } from "next/navigation"

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

const priorityOptions = ["Material", "Color", "Size"]

const normalizeOptionKey = (key: string) =>
  key.trim().toLowerCase().replace(/\s+/g, "_")

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
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
            <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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

  const { mutateAsync, isPending } = useAddLineItem()

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
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  // check if the selected variant is in stock
  const itemsInStock = selectedVariant
    ? getVariantItemsInStock(selectedVariant)
    : 0

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    await mutateAsync({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
    })

    setShowNotification(true)
  }

  const hasMultipleVariants = (product.variants?.length ?? 0) > 1
  const productOptions = (product.options || []).sort((a, b) => {
    let aPriority = priorityOptions.indexOf(a.title ?? "")
    let bPriority = priorityOptions.indexOf(b.title ?? "")

    if (aPriority === -1) {
      aPriority = priorityOptions.length
    }

    if (bPriority === -1) {
      bPriority = priorityOptions.length
    }

    return aPriority - bPriority
  })

  const materialOption = productOptions.find((o) => o.title === "Material")
  const colorOption = productOptions.find((o) => o.title === "Color")
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
    const sizeOption = productOptions.find((option) => option.title === "Size")
    const firstSizeValue = sizeOption?.values?.find((value) => Boolean(value.value))

    if (sizeOption && firstSizeValue && !options[sizeOption.id]) {
      setOptionValue(sizeOption.id, firstSizeValue.value)
    }
  }, [options, productOptions])

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
      <div className="max-md:text-xs mb-6 max-w-120">
        <p>{product.description}</p>
      </div>
      <div className="mb-8 md:mb-12">
        <UiDialogTrigger>
          <Button variant="unstyled" className="group inline-flex items-center gap-2 border border-grayscale-200 hover:border-black transition-colors px-4 py-2 text-xs tracking-widest uppercase font-medium text-grayscale-600 hover:text-black rounded-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 6H3"/><path d="M10 12H3"/><path d="M10 18H3"/><circle cx="17" cy="15" r="3"/><path d="m21 19-1.9-1.9"/></svg>
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
        <div className="flex flex-col gap-8 md:gap-6 mb-4 md:mb-12">
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
              const isSizeOption = option.title === "Size"

              if (isSizeOption) {
                const sizeValues = (option.values ?? []).filter((value) =>
                  Boolean(value.value)
                )

                return (
                  <div key={option.id}>

                    <div className="flex flex-wrap gap-3">
                      {sizeValues.map((value) => {
                        const isSelected = options[option.id] === value.value

                        return (
                          <button
                            key={value.id}
                            type="button"
                            onClick={() => setOptionValue(option.id, value.value)}
                            disabled={!!disabled || isPending}
                            aria-pressed={isSelected}
                            aria-label={`${option.title} ${value.value}`}
                            className={
                              `min-w-20 h-14 rounded-2xl border px-6 text-base font-medium transition-colors ` +
                              (isSelected
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
              }

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
                  <ReactAria.Select
                    selectedKey={options[option.id] ?? null}
                    onSelectionChange={(value) => {
                      setOptionValue(option.id, `${value}`)
                    }}
                    placeholder={`Choose ${option.title.toLowerCase()}`}
                    className="w-full md:w-60"
                    isDisabled={!!disabled || isPending}
                    aria-label={option.title}
                  >
                    <UiSelectButton className="!h-12 px-4 gap-2 max-md:text-base">
                      <UiSelectValue />
                      <UiSelectIcon className="h-6 w-6" />
                    </UiSelectButton>
                    <ReactAria.Popover className="w-[--trigger-width]">
                      <UiSelectListBox>
                        {(option.values ?? [])
                          .filter((value) => Boolean(value.value))
                          .map((value) => (
                            <UiSelectListBoxItem
                              key={value.id}
                              id={value.value}
                            >
                              {value.value}
                            </UiSelectListBoxItem>
                          ))}
                      </UiSelectListBox>
                    </ReactAria.Popover>
                  </ReactAria.Select>
                </div>
              )
            })}
        </div>
      )}
      <div className="flex items-stretch gap-4">
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
    </>
  )
}

export default withReactQueryProvider(ProductActions)
