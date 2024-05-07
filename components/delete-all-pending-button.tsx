"use client"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

import { Icons } from "@/components/icons"
import { toast } from "./ui/use-toast"
import { useRouter } from "next/navigation"
import React from "react"


interface DeleteAllPendingButtonProps extends ButtonProps {
  newsletterId: string
}

async function deleteAllPending(newsletterId: string) {
  const response = await fetch(`/api/newsletters/${newsletterId}/subscribers/delete_all_pending`, {
    method: "POST",
  })

  if (!response?.ok) {
    toast({
      title: "Something went wrong.",
      description: "Subscribers were not deleted. Please try again.",
      variant: "destructive",
    })
  }

  return true
}

export function DeleteAllPendingButton({
  newsletterId,
  className,
  variant,
}: DeleteAllPendingButtonProps) {
  const [isSpammerLoading, setIsSpammerLoading] = React.useState<boolean>(false)
  const router = useRouter()
  return (
    <button 
      onClick={async (event) => {
        event.preventDefault()
        setIsSpammerLoading(true)

        const deleted = await deleteAllPending(newsletterId)

        if (deleted) {
          setIsSpammerLoading(false)
          router.refresh()
        }
      }}
      className={cn(
        buttonVariants({ variant }),
        className
      )}
    >
      {isSpammerLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.trash className="mr-2 h-4 w-4" />
        )}
        <span>Delete all pending</span>
      
    </button>
  )
}
