"use client"
import { useParams, usePathname } from "next/navigation"
import { twMerge } from "tailwind-merge"
import Image from "next/image"
import { Layout, LayoutColumn } from "@/components/Layout"
import { LocalizedLink } from "@/components/LocalizedLink"
import { SocialLinks } from "@/components/SocialLinks"

export const Footer: React.FC = () => {
  const pathName = usePathname()
  const { countryCode } = useParams()
  const currentPath = pathName.split(`/${countryCode}`)[1]
  const isAuthPage = currentPath === "/register" || currentPath === "/login"

  return (
    <div
      className={twMerge(
        "bg-grayscale-50 py-8 md:py-12",
        isAuthPage && "hidden"
      )}
    >
      <Layout>
        <LayoutColumn className="col-span-13">
          <div className="flex flex-col items-center gap-6 text-center">
            <LocalizedLink href="/">
              <Image
                src="/images/content/logo.jpg"
                width={150}
                height={50}
                alt="The Juneberry"
                className="h-10 w-auto object-contain"
              />
            </LocalizedLink>

            <SocialLinks />

            <p className="text-xs text-grayscale-400">
              &copy; {new Date().getFullYear()}, The Juneberry
            </p>
          </div>
        </LayoutColumn>
      </Layout>
    </div>
  )
}
