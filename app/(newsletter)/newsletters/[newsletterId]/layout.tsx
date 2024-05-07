import Link from "next/link"

import { marketingConfig } from "@/config/marketing"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"

interface NewsletterLayoutProps {
  children: React.ReactNode
}




export default async function NewsletterLayout({
  children,
}: NewsletterLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-xl px-3 md:px-10 flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-16 items-center justify-between py-4">
        </div>
      </header>
      <main className="flex-1">{children}</main>
      {/* <SiteFooter className="border-t" /> */}
    </div>
  )
}