import Link from "next/link"

import { notFound, redirect } from "next/navigation"
import { Newsletter, SubscriberStatus, User } from "@prisma/client"
import { getCurrentUser } from "@/lib/session"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

import { db } from "@/lib/db"
import { DocsPageHeader } from "@/components/page-header"
import { SubscribeForm } from "@/components/subscirbe-form"
import { Sub } from "@radix-ui/react-menubar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const amrhextotext = require('amrhextotext')

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  metadataBase: new URL('https://recur.email'),
}

async function getNewsletterForUser(username: Newsletter["username"]) {
  return await db.newsletter.findFirst({
    where: {
      username,
    },
  })
}

interface NewsletterPageProps {
  params: { newsletterId: string, hashId: string }
}
  


export default async function NewsletterSubscribePage({ params }: NewsletterPageProps) {
  const newsletter = await getNewsletterForUser(params.newsletterId) 
  if(!newsletter || !newsletter.username) {
    notFound()
  }
  return (
    <div>
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">
              You&apos;re almost in! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-l mb-3 mt-1">
            You should receive an email shortly with a link to confirm your subscription.
            </div>
          </CardContent>
        </Card>
    </div>

  )
}
