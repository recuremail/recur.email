"use client"

import * as React from "react"
import { redirect, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@prisma/client"
import { useForm } from "react-hook-form"
import * as z from "zod"
import va from "@vercel/analytics"


import { cn } from "@/lib/utils"
import { newsletterSetupSchema } from "@/lib/validations/schemas"
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

interface NewsletterCreateFormProps extends React.HTMLAttributes<HTMLFormElement> {

}

type FormData = z.infer<typeof newsletterSetupSchema>

export function NewsletterCreateForm({ className, ...props }: NewsletterCreateFormProps) {
  const router = useRouter()
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(newsletterSetupSchema),
    defaultValues: {
    },
  })
  const [isSaving, setIsSaving] = React.useState<boolean>(false)

  async function onSubmit(data: FormData) {
    setIsSaving(true)

    const response = await fetch("/api/newsletters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: data.username,
        name: data.name,
        description: data.description,
      }),
    })

    setIsSaving(false)

    if (!response?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Newseletter was not created. Please try again.",
        variant: "destructive",
      })
    }

    toast({
      description: "Your newseletter was created.",
    })
    va.track("newseletter.create", { ...data })
    router.refresh()
    router.replace(`/dashboard/${data.username}`)
  }

  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>Create new newsletter</CardTitle>
          <CardDescription>
          Please fill in the details of your new newsletter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1 mb-3">
            <Label className="mb-1" htmlFor="username">
            Username
            </Label>
            <Input
              id="username"
              className="w-full"
              placeholder="helloworld"
              size={32}
              {...register("username")}
            />
            {errors?.username && (
              <p className="px-1 text-xs text-red-600">{errors.username.message}</p>
            )}
          </div>
          <div className="grid gap-1 mb-3">
            <Label className="mb-1" htmlFor="name">
            Name
            </Label>
            <Input
              id="name"
              className="w-full"
              placeholder="Hello World"
              size={32}
              {...register("name")}
            />
            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-1 mb-3">
            <Label className="mb-1" htmlFor="description">
            Description
            </Label>
            <Textarea
              id="description"
              className="w-full"
              placeholder="This is newsletter about..."
              {...register("description")}
            />
            {errors?.description && (
              <p className="px-1 text-xs text-red-600">{errors.description.message}</p>
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