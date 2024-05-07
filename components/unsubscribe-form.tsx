"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@prisma/client"
import { useForm } from "react-hook-form"
import * as z from "zod"
import va from "@vercel/analytics"


import { cn } from "@/lib/utils"
import { newSubscriberSchema } from "@/lib/validations/schemas"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { Textarea } from "./ui/textarea"

interface UnsubscribeFormProps extends React.HTMLAttributes<HTMLFormElement> {
  newsletterUsername: string,
  subscriberId: string,
  subscriberEmail: string,
}

type FormData = z.infer<typeof newSubscriberSchema>

export function UnsubscribeForm({ newsletterUsername, subscriberId, subscriberEmail, className, ...props }: UnsubscribeFormProps) {
  const router = useRouter()
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {},
  })
  const [isSaving, setIsSaving] = React.useState<boolean>(false)

  async function onSubmit(data: FormData) {
    setIsSaving(true)

    
    const response = await fetch(`/api/newsletters/${newsletterUsername}/subscribers/${subscriberId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }
    })

    setIsSaving(false)

    if (!response?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "You were not unsubscribed. Please try again.",
        variant: "destructive",
      })
    }

    toast({
      description: "You are now unsubscribed.",
    })
    va.track("newsletter.subscriber.delete", { email: subscriberEmail })
    router.refresh()
  }

  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="mb-3 flex space-x-2">
        <button
          type="submit"
          className={cn(buttonVariants(), className, "shrink-0")}
          disabled={isSaving}
        >
          {isSaving && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          <span>Unsubscribe</span>
        </button>
      </div>
      
    </form>
  )
}