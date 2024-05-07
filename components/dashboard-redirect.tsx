"use client"

import * as React from "react"

import { useSessionStorage } from 'usehooks-ts'
import { User } from "@prisma/client"

interface DashboardRedirectProps {
  user: Pick<User, "id"> | null
}

export function DashboardRedirect({
  user
}: DashboardRedirectProps) {
  const [returnTo, saveReturnTo] = useSessionStorage("returnTo", "dashboard");
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (user) {
        saveReturnTo("dashboard")
      }
    }, 100)

    return () => clearTimeout(timeout)

  }, [show])
  

  return (
   <></>
  )
}
