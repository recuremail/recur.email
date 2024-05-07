import Link from "next/link"

import { notFound, redirect } from "next/navigation"
import { Newsletter, SubscriberStatus, User } from "@prisma/client"

import { db } from "@/lib/db"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const amrhextotext = require('amrhextotext')
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
  


export default async function NewsletterConfirmPage({ params }: NewsletterPageProps) {
  const newsletter = await getNewsletterForUser(params.newsletterId) 
  if(!newsletter || !newsletter.username) {
    notFound()
  }
  const subscriberId = amrhextotext.hexToUtf8(params.hashId)
  const subscriber = await db.subscriber.findUnique({
    where: {
      id: subscriberId
    }
  })
  if(!subscriber) {
    notFound()
  }
  const updatedSubscriber = await db.subscriber.update({
    where: {
      id: subscriberId,
      status: {
        not: SubscriberStatus.VERIFIED
      }
    },
    data: {
      status: SubscriberStatus.VERIFIED,
      verifiedAt: new Date(),
      confirmedAt: new Date()
    }
  })
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
            You&apos;ve successfully subscribed to <strong>{newsletter.name}</strong> via your email at <strong>{subscriber.email}</strong>
            </div>
            <p className="text-s text-muted-foreground">
            The next issue will be delivered to your inbox. Or you can check the <Link className="text-blue-500" href={`https://${newsletter.username}.recur.email`}>archive</Link> to see past issues.
            </p>
          </CardContent>
        </Card>
    </div>

  )
}
