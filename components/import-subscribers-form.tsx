"use client"

import * as React from "react"
import { Icons } from "@/components/icons"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import va from "@vercel/analytics"
import { buttonVariants } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Newsletter } from "@prisma/client"
import { Separator } from "@/components/ui/separator"

const ImportSubscribersFormSchema = z.object({
  subscribersText: z.string().optional(),
  // subscribersFile: z.string().min(1).max(256).optional(),
})

type ImportSubscribersFormValues = z.infer<typeof ImportSubscribersFormSchema>


interface NewsletterItemProps {
  newsletter: Pick<Newsletter, "id" | "username" | "name" | "description" >
}


export function ImportSubscribersForm({ newsletter }: NewsletterItemProps) {
  const router = useRouter()
  const form = useForm<ImportSubscribersFormValues>({
    resolver: zodResolver(ImportSubscribersFormSchema),
    defaultValues: {
      subscribersText: "email, date\nhello@recur.email, 2023-09-14",
      // subscribersFile: "",
    },
  })

  const [isSaving, setIsSaving] = React.useState<boolean>(false)
  async function onSubmit(data: ImportSubscribersFormValues) {
    setIsSaving(true)
    console.log('form data', data)
    const response = await fetch(`/api/newsletters/${newsletter.username}/subscribers/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribersText: data.subscribersText,
        // subscribersFile: data.subscribersFile,
      }),
    })

    setIsSaving(false)

    if (!response?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Import did not work. Please try again.",
        variant: "destructive",
      })
    }

    toast({
      description: "Subscribers were imported.",
    })
    va.track("newseletter.subscribers.import", { newsletter: newsletter.username })
    router.refresh()
    router.push(`/dashboard/${newsletter.username}/subscribers`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-2">
        <div>
          <h3 className="mb-4 text-lg font-medium">Import subscribers from CSV text</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="subscribersText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CSV content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="email, date" {...field} />
                  </FormControl>
                  <FormDescription>
                    CSV with has &lsquo;email&rsquo; column and optional &lsquo;date&rsquo; column.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <Separator className="my-4" />
            <p>or</p>
            <Separator className="my-4" />
            <FormField
              control={form.control}
              name="subscribersFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CSV file</FormLabel>
                  <FormControl>
                    <Input accept="text/csv" type="file" {...field} />
                  </FormControl>
                  <FormDescription>
                    CSV file that has &lsquo;email&rsquo; column and optional &lsquo;date&rsquo; column.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            
          </div>
        </div>
        <Button
            type="submit"
            // className={cn(buttonVariants(), className)}
            disabled={isSaving}
          >
            {isSaving && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            <span>Import</span>
          </Button>
      </form>
    </Form>
  )
}