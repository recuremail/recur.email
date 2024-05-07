"use client"

import * as React from "react"
import { redirect, useRouter } from "next/navigation"

import { useSessionStorage } from 'usehooks-ts'
import { User } from "@prisma/client"

interface IndexRedirectProps {
  user: Pick<User, "id"> | null
}

export function IndexRedirect({
  user
}: IndexRedirectProps) {
  const [returnTo, saveReturnTo] = useSessionStorage("returnTo", "dashboard");
  const router = useRouter()
  if (user) {
    console.log('home page.?', returnTo)
    router.refresh()
    router.replace(`/` + returnTo)
  }

  return (
   <></>
  )
}
