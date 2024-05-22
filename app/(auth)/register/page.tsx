import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { UserAuthForm } from "@/components/user-auth-form"
import { Suspense } from "react"

export const metadata = {
  title: "Create an account",
  description: "Create an account to get started.",
  robots: "noindex",
}

export default function RegisterPage() {
  return (
    <div className="container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      Registration is disabled for now. Please check back later.
    </div>
  )
}
