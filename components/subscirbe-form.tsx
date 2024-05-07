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

interface SubscribeFormProps extends React.HTMLAttributes<HTMLFormElement> {
  newsletterUsername: string,
}

type FormData = z.infer<typeof newSubscriberSchema>

export function SubscribeForm({ newsletterUsername, className, ...props }: SubscribeFormProps) {
  const router = useRouter()
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(newSubscriberSchema),
    defaultValues: {},
  })
  const [isSaving, setIsSaving] = React.useState<boolean>(false)

  async function onSubmit(data: FormData) {
    setIsSaving(true)

    
    const response = await fetch(`/api/newsletters/${newsletterUsername}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
      }),
    })

    setIsSaving(false)

    if (!response?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Your subscription was not submitted. Please try again.",
        variant: "destructive",
      })
    }

    const body = await response.json()
    const status = body?.status
    if (status === "already subscribed") {
      toast({
        description: "You already subscribed to this newsletter.",
      })
    } else {
      toast({
        description: "Your subscription was submmited. Please check your email to confirm.",
      })
    }
    
    
    va.track("newsletter.subscriber.create", { name: data.email })
    data.email = ''
    router.refresh()
  }

  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="mb-3 flex space-x-2">
        <Input
          id="email"
          // className=""
          placeholder="hello@recur.email"
          {...register("email")}
        />
        {errors?.email && (
          <p className="px-1 text-xs text-red-600">{errors.email.message}</p>
        )}
        <button
          type="submit"
          className={cn(buttonVariants(), className, "shrink-0")}
          disabled={isSaving}
        >
          {isSaving && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          <span>Subscribe</span>
        </button>
      </div>
      
    </form>
  )
}