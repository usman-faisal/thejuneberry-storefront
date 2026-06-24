import { Metadata } from "next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Mona_Sans } from "next/font/google"
import { getBaseURL } from "@lib/util/env"

import "../styles/globals.css"
import React from "react"
import { WebMCPProvider } from "@lib/webmcp/WebMCPProvider"
import FacebookPixel from "./pixel"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "The Juneberry | Premium Master Copies & Designer Replicas",
    template: "%s | The Juneberry - Premium Designer Replicas",
  },
  description: "Shop the finest quality master copies and replicas of famous Pakistani brands like Khaadi, Ethnic, and Afrozah. Premium designer replicas delivered to your doorstep.",
  icons: {
    icon: "/images/content/logo.jpg",
  },
  openGraph: {
    title: {
      default: "The Juneberry | Premium Master Copies & Designer Replicas",
      template: "%s | The Juneberry - Premium Designer Replicas",
    },
    description: "Shop the finest quality master copies and replicas of famous Pakistani brands like Khaadi, Ethnic, and Afrozah. Premium designer replicas delivered to your doorstep.",
    siteName: "The Juneberry",
    images: [
      {
        url: "/images/content/juneberry_hero.png",
        width: 1200,
        height: 630,
        alt: "The Juneberry",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "The Juneberry | Premium Master Copies & Designer Replicas",
      template: "%s | The Juneberry - Premium Designer Replicas",
    },
    description: "Shop the finest quality master copies and replicas of famous Pakistani brands like Khaadi, Ethnic, and Afrozah. Premium designer replicas delivered to your doorstep.",
    images: ["/images/content/juneberry_hero.png"],
  },
}

const monaSans = Mona_Sans({
  preload: true,
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  weight: "variable",
  variable: "--font-mona-sans",
})

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className="antialiased">
      <body className={`${monaSans.className}`}>
        <FacebookPixel />
        <main className="relative">{props.children}</main>
        <SpeedInsights />
        <WebMCPProvider />
      </body>
    </html>
  )
}
