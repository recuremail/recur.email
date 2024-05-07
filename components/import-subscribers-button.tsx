"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

import { Icons } from "@/components/icons"


interface ImportSubscribersButtonProps extends ButtonProps {
  url: string
}

export function ImportSubscribersButton({
  url,
  className,
  variant,
}: ImportSubscribersButtonProps) {
  

  return (
    <a href={url}
      className={cn(
        buttonVariants({ variant }),
        className
      )}
    >
      <Icons.add className="mr-2 h-4 w-4" />
      Import subscribers
    </a>
  )
}
