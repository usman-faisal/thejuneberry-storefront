import { HttpTypes } from "@medusajs/types"

export type SelectedLineItemOption = {
  title: string
  value: string
}

type LineItemWithMetadata =
  | HttpTypes.StoreCartLineItem
  | HttpTypes.StoreOrderLineItem

export const getLineItemSelectedOptions = (
  item: LineItemWithMetadata
): SelectedLineItemOption[] => {
  const selectedOptions = item.metadata?.selected_options

  if (!Array.isArray(selectedOptions)) {
    return []
  }

  return selectedOptions.filter(
    (option): option is SelectedLineItemOption =>
      typeof option === "object" &&
      option !== null &&
      "title" in option &&
      "value" in option &&
      typeof option.title === "string" &&
      typeof option.value === "string"
  )
}

export const formatLineItemSelectedOptions = (
  options: SelectedLineItemOption[]
) => options.map((option) => `${option.title}: ${option.value}`).join(", ")
