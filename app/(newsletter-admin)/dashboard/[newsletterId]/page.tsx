import { notFound, redirect } from "next/navigation"
import { Newsletter, OutboundEmailStatus, SubscriberStatus, User } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { NewsletterSettingsForm } from "@/components/newsletter-settings-form"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Mail, CircleDot, UserMinus, Mails } from "lucide-react"
import moment from "moment"
import numeral from 'numeral'
import { DashboardNav } from "@/components/nav"
import { dashboardConfig } from "@/config/dashboard"
import { countPotentialSpammers } from "@/lib/planetscale"



async function getNewsletterForUser(username: Newsletter["username"], userId: User["id"]) {
  return await db.newsletter.findFirst({
    where: {
      username,
      userId,
    },
    include: {
      user: true
    }
  })
}

interface NewsletterSettingsPageProps {
  params: { newsletterId: string }
}
  


export default async function NewsletterSettingsPage({ params }: NewsletterSettingsPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login")
  }

  
  const newsletter = await getNewsletterForUser(params.newsletterId, user.id)

  if (!newsletter) {
    notFound()
  }
  const newsletterId = newsletter.id
  const sevenDaysAgo = moment().subtract(7, 'days').toDate();
  const subscribersCount = await db.subscriber.count({
    where: {
      newsletterId,
      status: SubscriberStatus.VERIFIED
    }
  })

  const subscribersCountInLast7Days = await db.subscriber.count({
    where: {
      newsletterId,
      status: SubscriberStatus.VERIFIED,
      createdAt: {
        gte: sevenDaysAgo
      }
    }
  })

  const pendingSubscribersCount = await db.subscriber.count({
    where: {
      newsletterId,
      status: SubscriberStatus.PENDING
    }
  })

  const pendingSubscribersCountInLast7Days = await db.subscriber.count({
    where: {
      newsletterId,
      status: SubscriberStatus.PENDING,
      createdAt: {
        gte: sevenDaysAgo
      }
    }
  })

  const unsubscribedSubscribersCount = await db.subscriber.count({
    where: {
      newsletterId,
      status: SubscriberStatus.UNSUBSCRIBED
    }
  })

  const unsubscribedSubscribersCountInLast7Days = await db.subscriber.count({
    where: {
      newsletterId,
      status: SubscriberStatus.UNSUBSCRIBED,
      createdAt: {
        gte: sevenDaysAgo
      }
    }
  })


  const emailCount = await db.email.count({
    where: {
      newsletterId,
      deletedAt: null,
    }
  })

  const emailsCountInLast7Days = await db.email.count({
    where: {
      newsletterId,
      createdAt: {
        gte: sevenDaysAgo
      }
    }
  })

  const outboundEmailsCount = await db.outboundEmail.count({
    where: {
      newsletterId,
      status: OutboundEmailStatus.SENT
    }
  })

  const outboundEmailsCountInLast7Days = await db.outboundEmail.count({
    where: {
      newsletterId,
      status: OutboundEmailStatus.SENT,
      createdAt: {
        gte: sevenDaysAgo
      }
    }
  })

  let allowedEmails = [newsletter?.user.email]
  newsletter.editorsEmails?.split(',').forEach((e)=> {
    if (e.trim() != "") {
      allowedEmails.push(e.trim())
    }
  })

  const potentialSpammersCount = await countPotentialSpammers(newsletterId)

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`${newsletter?.name}`}
        text="Newsletter and basic stats."
      />
      <div className="grid gap-6">
        <DashboardNav items={dashboardConfig.sidebarNav} basePath={"/dashboard/" + newsletter.username} currentPath={"/dashboard/" + newsletter.username}/>
        <div className="px-2">
          <p>
            You can write to <a className="text-blue-500" href={`mailto:${newsletter?.inboundAddress}`}>{newsletter?.inboundAddress}</a> to send a new issue to {subscribersCount} active subscribers.
            <br/>
            Only write from {
              allowedEmails.map((email, index)=> {
                if(index == allowedEmails.length -1) {
                  return <a className="text-blue-500" href={`mailto:${email}`}>{email}</a>  
                }
                return <><a className="text-blue-500" href={`mailto:${email}`}>{email}</a>,&nbsp;</>
              })
            }.
            <br/>
            People can subsribe at <a className="text-blue-500" href={`https://${newsletter?.username}.recur.email`}>{`${newsletter?.username}.recur.email`}</a>.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subscribers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscribersCount}</div>
              <p className="text-xs text-muted-foreground">
                +{numeral(subscribersCountInLast7Days/subscribersCount).format('0.00%')} from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Subscribers
              </CardTitle>
              <CircleDot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingSubscribersCount}</div>
              <p className="text-xs text-muted-foreground">
                +{numeral(pendingSubscribersCountInLast7Days/pendingSubscribersCount).format('0.00%')} from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unsubscribed
              </CardTitle>
              <UserMinus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unsubscribedSubscribersCount}</div>
              <p className="text-xs text-muted-foreground">
                +{numeral(unsubscribedSubscribersCountInLast7Days/unsubscribedSubscribersCount).format('0.00%')} from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Potential Spammers
              </CardTitle>
              <UserMinus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{potentialSpammersCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Emails
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailCount}</div>
              <p className="text-xs text-muted-foreground">
                +{numeral(emailsCountInLast7Days/emailCount).format('0.00%')} from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Outbound Emails
              </CardTitle>
              <Mails className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outboundEmailsCount}</div>
              <p className="text-xs text-muted-foreground">
              +{numeral(outboundEmailsCountInLast7Days/outboundEmailsCount).format('0.00%')} from last month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
