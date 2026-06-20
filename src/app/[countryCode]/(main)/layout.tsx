import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {props.children}
      <Footer />
      <a
        href="https://wa.me/923313365411"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
        className="fixed bottom-6 right-6 z-50 group flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
        aria-label="Contact us on WhatsApp"
      >
        {/* Pulse ring */}
        <span className="absolute inline-flex w-full h-full rounded-full bg-[#25D366] opacity-30 animate-ping" />
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" className="relative z-10">
          <path fillRule="evenodd" clipRule="evenodd" d="M12.028 2C6.486 2 2 6.48 2 12.018c0 1.77.462 3.498 1.34 5.022L2 22l5.122-1.343c1.472.802 3.124 1.222 4.81 1.224h.004c5.54 0 9.992-4.433 9.994-9.972C21.933 6.386 17.478 2 12.028 2zm5.545 13.916c-.244.685-1.201 1.246-1.656 1.312-.454.067-.9-.015-2.883-.787-2.533-.987-4.148-3.528-4.27-3.69-.123-.162-.993-1.31-1.002-2.463-.01-1.154.593-1.723.837-1.967.243-.243.535-.297.712-.297.18 0 .36.002.518.01.168.007.393-.064.615.467.227.545.78 1.884.846 2.016.068.132.113.286.023.463-.09.18-.135.277-.27.433-.135.156-.285.348-.407.468-.136.13-.277.272-.119.54.157.268.7 1.135 1.5 1.838.995.88 1.832 1.15 2.096 1.258.263.11.416.09.57.01.155-.078.67-.77 1.05-.77.158 0 .339.04.496.108.158.068 1.002.474 1.171.558.17.085.283.126.326.198.04.073.04.422-.204 1.107z" />
        </svg>
        {/* Tooltip */}
        <span className="absolute right-16 bg-black text-white text-xs px-3 py-1.5 rounded-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat with us
        </span>
      </a>
    </>
  )
}
