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
import { newsletterUpdateSchema } from "@/lib/validations/schemas"
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
import { toast } from "@/components/ui/use-toast"
import { Newsletter } from "@prisma/client"


type NewsletterSettingsFormValues = z.infer<typeof newsletterUpdateSchema>


interface NewsletterItemProps {
  newsletter: Pick<Newsletter, "id" | "username" | "name" | "description" | "website" | 
  
  "editorsEmails" | "twitter" | "emoji" | "keywords" | "fromName" | "trackLinks" | "trackOpens" | "webArchive" | "webArchiveOnHomePage">
}

export function NewsletterSettingsForm({ newsletter }: NewsletterItemProps) {
  const router = useRouter()
  const form = useForm<NewsletterSettingsFormValues>({
    resolver: zodResolver(newsletterUpdateSchema),
    defaultValues: {
      name: newsletter.name || "",
      description: newsletter.description || "",
      fromName: newsletter.fromName || "",
      website: newsletter.website || "",
      twitter: newsletter.twitter || "",
      keywords: newsletter.keywords || "",
      emoji: newsletter.emoji || "",
      editorsEmails: newsletter.editorsEmails || "",
      trackLinks: newsletter.trackLinks,
      trackOpens: newsletter.trackOpens,
      webArchive: newsletter.webArchive,
      webArchiveOnHomePage: newsletter.webArchiveOnHomePage,
    },
  })

  const [isSaving, setIsSaving] = React.useState<boolean>(false)
  async function onSubmit(data: NewsletterSettingsFormValues) {
    setIsSaving(true)
    console.log('form data', data)
    const response = await fetch(`/api/newsletters/${newsletter.username}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        fromName: data.fromName,
        website: data.website,
        twitter: data.twitter,
        emoji: data.emoji,
        keywords: data.keywords,
        editorsEmails: data.editorsEmails,
        trackLinks: data.trackLinks,
        trackOpens: data.trackOpens,
        webArchive: data.webArchive,
        webArchiveOnHomePage: data.webArchiveOnHomePage,
      }),
    })

    setIsSaving(false)

    if (!response?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Settings were not updated. Please try again.",
        variant: "destructive",
      })
    }

    toast({
      description: "Settings were updated.",
    })
    va.track("newseletter.settings.update", { ...data })
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-2">
        <div>
          {/* <h3 className="mb-4 text-lg font-medium">Newsletter Settings</h3> */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Hello World" {...field} />
                  </FormControl>
                  <FormDescription>
                    Change the name of your newsletter.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="This is newsletter about..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Change the description of your newsletter.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fromName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name.." {...field} />
                  </FormControl>
                  <FormDescription>
                    Set the name that will appear in the from field of your emails.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="editorsEmails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Editors&lsquo; emails</FormLabel>
                  <FormControl>
                    <Input placeholder="hello@montaigne.io" {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma separated list of emails that can send emails to your newsletter.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="montaigne.io" {...field} />
                  </FormControl>
                  <FormDescription>
                    Website for your newsletter.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter</FormLabel>
                  <FormControl>
                    <Input placeholder="@montaigne_io" {...field} />
                  </FormControl>
                  <FormDescription>
                    Twitter account.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input placeholder="tech, life" {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma separated keywords.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emoji</FormLabel>
                  <FormControl>
                    <Input placeholder="🍉" {...field} />
                  </FormControl>
                  <FormDescription>
                    Pick your emoji if you want.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trackOpens"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Track opens
                    </FormLabel>
                    <FormDescription>
                      Track email open rates.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trackLinks"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Track links
                    </FormLabel>
                    <FormDescription>
                      Track link clicks rates.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="webArchive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Web archive
                    </FormLabel>
                    <FormDescription>
                      Show all emails for your newsletter at https://{newsletter.username}.recur.email/issues.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="webArchiveOnHomePage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Web archive on homepage
                    </FormLabel>
                    <FormDescription>
                      Show all emails for your newsletter at https://{newsletter.username}.recur.email.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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
            <span>Update settings</span>
          </Button>
      </form>
    </Form>
  )
}