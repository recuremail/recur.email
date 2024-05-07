"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@prisma/client"
import { useForm } from "react-hook-form"
import * as z from "zod"
import va from "@vercel/analytics"


import { cn } from "@/lib/utils"
import { userUrlsSchema } from "@/lib/validations/schemas"
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

interface UserUrlsFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: Pick<User, "id" | "url" | "twitter">
}

type FormData = z.infer<typeof userUrlsSchema>

export function UserUrlsForm({ user, className, ...props }: UserUrlsFormProps) {
  const router = useRouter()
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userUrlsSchema),
    defaultValues: {
      url: user?.url || "",
      twitter: user?.twitter || "",
    },
  })
  const [isSaving, setIsSaving] = React.useState<boolean>(false)

  async function onSubmit(data: FormData) {
    setIsSaving(true)

    const response = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: data.url,
        twitter: data.twitter,
      }),
    })

    setIsSaving(false)

    if (!response?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Your URL/Twitter were not updated. Please try again.",
        variant: "destructive",
      })
    }

    toast({
      description: "Your URL/Twitter have been updated.",
    })
    va.track("user.urls.update", { url: data.url || '', twitter: data.twitter || '' })
    router.refresh()
  }

  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your URLs</CardTitle>
          <CardDescription>
            Please enter your personal URL and/or Twitter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1 mb-3">
            <Label className="mb-1" htmlFor="url">
              Personal URL
            </Label>
            <Input
              id="url"
              className="w-full md:w-[400px]"
              size={32}
              {...register("url")}
            />
            {errors?.url && (
              <p className="px-1 text-xs text-red-600">{errors.url.message}</p>
            )}
          </div>
          <div className="grid gap-1 mb-3">
            <Label className="mb-1" htmlFor="twitter">
              Twitter username
            </Label>
            <Input
              id="twitter"
              className="w-full md:w-[400px]"
              size={32}
              {...register("twitter")}
            />
            {errors?.twitter && (
              <p className="px-1 text-xs text-red-600">{errors.twitter.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <button
            type="submit"
            className={cn(buttonVariants(), className)}
            disabled={isSaving}
          >
            {isSaving && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            <span>Save</span>
          </button>
        </CardFooter>
      </Card>
    </form>
  )
}
