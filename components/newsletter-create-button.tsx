"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

import { Icons } from "@/components/icons"


interface NewsletterCreateButtonProps extends ButtonProps {}

export function NewsletterCreateButton({
  className,
  variant,
}: NewsletterCreateButtonProps) {
  

  return (
    <a href="/new"
      className={cn(
        buttonVariants({ variant }),
        className
      )}
    >
      <Icons.add className="mr-2 h-4 w-4" />
      New
    </a>
  )
}
