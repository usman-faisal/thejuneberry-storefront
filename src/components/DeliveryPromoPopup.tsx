"use client"

import * as React from "react"
import { Icon } from "@/components/Icon"
import { LocalizedLink } from "@/components/LocalizedLink"

const STORAGE_KEY = "thejuneberry-free-delivery-popup-dismissed"

export const DeliveryPromoPopup = () => {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) === "true") {
      return
    }

    const timer = window.setTimeout(() => {
      setIsVisible(true)
    }, 1200)

    return () => window.clearTimeout(timer)
  }, [])

  const dismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, "true")
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <aside
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0, 0, 0, 0.35)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(360px, 100%)",
          background: "#fff",
          border: "1px solid #d9d9d9",
          boxShadow: "0 18px 45px rgba(0, 0, 0, 0.18)",
          padding: "34px 24px 26px",
          textAlign: "center",
        }}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss free delivery message"
          style={{
            position: "absolute",
            right: 10,
            top: 10,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: 0,
            cursor: "pointer",
          }}
        >
          <Icon name="close" style={{ width: 18, height: 18 }} />
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <Icon name="truck" style={{ width: 28, height: 28 }} />
        </div>

        <p
          style={{
            margin: "0 auto",
            maxWidth: 285,
            fontSize: 24,
            lineHeight: 1.2,
            fontWeight: 500,
            color: "#000",
          }}
        >
          Free delivery over PKR 10,000
        </p>
        <p
          style={{
            margin: "12px auto 0",
            maxWidth: 290,
            fontSize: 15,
            lineHeight: 1.55,
            color: "#777",
          }}
        >
          Add your favorites and we&apos;ll cover delivery on qualifying orders.
        </p>

        <div style={{ marginTop: 24 }}>
          <LocalizedLink
            href="/store"
            onClick={dismiss}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 44,
              background: "#000",
              color: "#fff",
              textDecoration: "none",
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            Shop now
          </LocalizedLink>
          <button
            type="button"
            onClick={dismiss}
            style={{
              marginTop: 12,
              background: "transparent",
              border: 0,
              color: "#777",
              cursor: "pointer",
              fontSize: 14,
              textDecoration: "underline",
              textUnderlineOffset: 4,
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </aside>
  )
}
