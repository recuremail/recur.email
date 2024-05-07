"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

import { Icons } from "@/components/icons"


interface ExportSubscribersButtonProps extends ButtonProps {
  url: string
}

export function ExportSubscribersButton({
  url,
  className,
  variant,
}: ExportSubscribersButtonProps) {
  

  return (
    <a href={url}
      className={cn(
        buttonVariants({ variant }),
        className
      )}
    >
      <Icons.add className="mr-2 h-4 w-4" />
      Export subscribers
    </a>
  )
}
