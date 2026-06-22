import { HttpTypes } from "@medusajs/types"

export function getCheckoutStep(cart?: HttpTypes.StoreCart) {
  // All checkout sections are always open in the flat checkout layout.
  // This function is kept for compatibility but no longer drives navigation.
  return "review"
}
