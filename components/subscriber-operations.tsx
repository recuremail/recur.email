"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Email, Newsletter, Subscriber, SubscriberStatus } from "@prisma/client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { Sub } from "@radix-ui/react-dropdown-menu"

async function markAsSpammerEmail(newsletterId: string, subscriberId: Subscriber["id"]) {
  const response = await fetch(`/api/newsletters/${newsletterId}/subscribers/${subscriberId}/mark_as_spammer`, {
    method: "POST",
  })

  if (!response?.ok) {
    toast({
      title: "Something went wrong.",
      description: "Subscriber was not deleted. Please try again.",
      variant: "destructive",
    })
  }

  return true
}

async function unsubscribeEmail(newsletterId: string, subscriberId: Subscriber["id"]) {
  const response = await fetch(`/api/newsletters/${newsletterId}/subscribers/${subscriberId}/unsubscribe`, {
    method: "DELETE",
  })

  if (!response?.ok) {
    toast({
      title: "Something went wrong.",
      description: "Subscriber was not deleted. Please try again.",
      variant: "destructive",
    })
  }

  return true
}

async function verifyEmail(newsletterId: string, subscriberId: Subscriber["id"]) {
  const response = await fetch(`/api/newsletters/${newsletterId}/subscribers/${subscriberId}/verify`, {
    method: "POST",
  })

  if (!response?.ok) {
    toast({
      title: "Something went wrong.",
      description: "Subscriber was not verified. Please try again.",
      variant: "destructive",
    })
  }

  return true
}

interface SubscriberOperationsProps {
  subscriber: Pick<Subscriber, "id" | "status">
  newsletter: Newsletter
}

export function SubscriberOperations({ subscriber, newsletter }: SubscriberOperationsProps) {
  const router = useRouter()
  const [showDeleteAlert, setShowDeleteAlert] = React.useState<boolean>(false)
  const [showVerifyAlert, setShowVerifyAlert] = React.useState<boolean>(false)
  const [showSpammerAlert, setShowSpammerAlert] = React.useState<boolean>(false)
  const [isDeleteLoading, setIsDeleteLoading] = React.useState<boolean>(false)
  const [isVerifyLoading, setIsVerifyLoading] = React.useState<boolean>(false)
  const [isSpammerLoading, setIsSpammerLoading] = React.useState<boolean>(false)
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted">
          <Icons.ellipsis className="h-4 w-4" />
          <span className="sr-only">Open</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
        {subscriber.status != SubscriberStatus.VERIFIED ?
        <DropdownMenuItem
            className="flex cursor-pointer items-center"
            onSelect={() => setShowVerifyAlert(true)}
          >
            Verify
          </DropdownMenuItem>
          : <></>}
          <DropdownMenuItem
            className="flex cursor-pointer items-center text-destructive focus:text-destructive"
            onSelect={() => setShowSpammerAlert(true)}
          >
            Mark as spammer and delete
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex cursor-pointer items-center text-destructive focus:text-destructive"
            onSelect={() => setShowDeleteAlert(true)}
          >
            Unsubscribe
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={showVerifyAlert} onOpenChange={setShowVerifyAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to verify this email?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You would be able to unsubscribe this email later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (event) => {
                event.preventDefault()
                setIsVerifyLoading(true)

                const verified = await verifyEmail(newsletter.username, subscriber.id)

                if (verified) {
                  setIsVerifyLoading(false)
                  setShowVerifyAlert(false)
                  router.refresh()
                }
              }}
              className="bg-green-600 focus:ring-red-600"
            >
              {isVerifyLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.trash className="mr-2 h-4 w-4" />
              )}
              <span>Verify</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to unsubscribe this email?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (event) => {
                event.preventDefault()
                setIsDeleteLoading(true)

                const deleted = await unsubscribeEmail(newsletter.username, subscriber.id)

                if (deleted) {
                  setIsDeleteLoading(false)
                  setShowDeleteAlert(false)
                  router.refresh()
                }
              }}
              className="bg-red-600 focus:ring-red-600"
            >
              {isDeleteLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.trash className="mr-2 h-4 w-4" />
              )}
              <span>Unsubscribe</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showSpammerAlert} onOpenChange={setShowSpammerAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to mark this email as spammer and delete it?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (event) => {
                event.preventDefault()
                setIsSpammerLoading(true)

                const deleted = await markAsSpammerEmail(newsletter.username, subscriber.id)

                if (deleted) {
                  setIsSpammerLoading(false)
                  setShowSpammerAlert(false)
                  router.refresh()
                }
              }}
              className="bg-red-600 focus:ring-red-600"
            >
              {isSpammerLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.trash className="mr-2 h-4 w-4" />
              )}
              <span>Mark as spammer and delete</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
