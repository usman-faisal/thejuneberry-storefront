"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useCountryCode } from "hooks/country-code"

export const HeaderWrapper: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const pathName = usePathname()
  const countryCode = useCountryCode()
  const currentPath = countryCode
    ? pathName.split(`/${countryCode}`)[1]
    : pathName
  // Hero images removed site-wide — header is always solid/sticky
  const isPageWithHeroImage = false
  const isAlwaysSticky =
    !currentPath ||
    currentPath === "/" ||
    currentPath.startsWith("/auth") ||
    currentPath.startsWith("/account") ||
    currentPath.startsWith("/collections") ||
    currentPath.startsWith("/store")

  React.useEffect(() => {
    if (isAlwaysSticky) {
      return
    }

    const headerElement = document.querySelector("#site-header")

    if (!headerElement) {
      return
    }

    const nextElement = headerElement.nextElementSibling
    let triggerPosition = 0

    const updateTriggerPosition = () => {
      if (isPageWithHeroImage) {
        triggerPosition = nextElement
          ? Math.max(nextElement.clientHeight - headerElement.clientHeight, 1)
          : 200
      } else {
        triggerPosition = nextElement
          ? Math.max(
              Number.parseInt(
                window.getComputedStyle(nextElement).paddingTop,
                10
              ) - headerElement.clientHeight,
              1
            )
          : 1
      }
    }

    const handleScroll = () => {
      const position = window.scrollY

      headerElement.setAttribute(
        "data-sticky",
        position > triggerPosition ? "true" : "false"
      )
    }

    updateTriggerPosition()
    handleScroll()

    window.addEventListener("resize", updateTriggerPosition, {
      passive: true,
    })
    window.addEventListener("orientationchange", updateTriggerPosition, {
      passive: true,
    })
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    })

    return () => {
      window.removeEventListener("resize", updateTriggerPosition)
      window.removeEventListener("orientationchange", updateTriggerPosition)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [pathName, isPageWithHeroImage, isAlwaysSticky])

  return (
    <div
      id="site-header"
      className="top-0 left-0 w-full bg-white text-black shadow-sm transition-colors fixed z-40 group"
      data-light={false}
      data-sticky={true}
    >
      {children}
    </div>
  )
}
