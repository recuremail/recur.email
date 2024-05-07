import { Metadata } from "next"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { UserAuthForm } from "@/components/user-auth-form"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Welcome | recur.email",
  description: "Sign in to your account using email.",
  robots: "noindex",
}

export default function LoginPage() {
  
  // Get the query parameter from the URL
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8"
        )}
      >
        <>
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          Back
        </>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <span className="mx-auto h-6 w-6 text-lg">💌</span>
          <h1 className="text-2xl font-semibold tracking-tight">
          Welcome
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account using email.
          </p>
        </div>
        <Suspense>
          <UserAuthForm />
        </Suspense>
        <p className="text-center">
          Don&apos;t have an account? <Link className="font-semibold no-underline hover:underline" href="/register">Sign up.</Link>
        </p>
      </div>
    </div>
  )
}
