import Link from "next/link"

import { notFound, redirect } from "next/navigation"
import { Newsletter, SubscriberStatus, User } from "@prisma/client"

import { db } from "@/lib/db"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UnsubscribeForm } from "@/components/unsubscribe-form"

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  metadataBase: new URL('https://recur.email'),
}

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
  


export default async function NewsletterUnsubscribePage({ params }: NewsletterPageProps) {
  const newsletter = await getNewsletterForUser(params.newsletterId) 
  // console.log('abc', newsletter)
  if(!newsletter || !newsletter.username) {
    notFound()
  }
  const subscriberId = amrhextotext.hexToUtf8(params.hashId)
  
  const subscriber = await db.subscriber.findUnique({
    where: {
      id: subscriberId
    }
  })
  // console.log('subscriber', subscriber)
  if(!subscriber) {
    notFound()
  }
  if(subscriber.status != SubscriberStatus.VERIFIED) {
    return (
      <div>
          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">
                You&apos;re not subscribed! 😢
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-l mb-3 mt-1">
              You are not subscribed to <strong>{newsletter.name}</strong> via your email at <strong>{subscriber.email}</strong>.
              </div>
            </CardContent>
          </Card>
      </div>
    )
  }
  return (
    <div>
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">
              You&apos;re going to unsubscribe! 😢
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-l mb-3 mt-1">
            Unsubscribe from <strong>{newsletter.name}</strong> via your email at <strong>{subscriber.email}</strong>.
            </div>
            <p className="text-s text-muted-foreground mb-4">
            Click unsubscribe to stop receiving updates.
            </p>
            <UnsubscribeForm newsletterUsername={newsletter?.username} subscriberId={subscriber.id} subscriberEmail={subscriber.email} />
          </CardContent>
        </Card>
    </div>
  )
}
