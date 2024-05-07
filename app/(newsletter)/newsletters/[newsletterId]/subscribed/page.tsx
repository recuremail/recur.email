import Link from "next/link"

import { notFound, redirect } from "next/navigation"
import { Newsletter, SubscriberStatus, User } from "@prisma/client"

import { db } from "@/lib/db"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
              You&apos;re in! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-l mb-3 mt-1">
            You already subscribed to this newsletter.
            </div>
          </CardContent>
        </Card>
    </div>

  )
}
