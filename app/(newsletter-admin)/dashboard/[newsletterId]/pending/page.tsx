import { notFound, redirect } from "next/navigation"
import { Newsletter, OutboundEmailStatus, User, SubscriberStatus } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { NewsletterSettingsForm } from "@/components/newsletter-settings-form"
import { db } from "@/lib/db"
import { DollarSign, Users, Mail } from "lucide-react"
import moment from 'moment'
import numeral from 'numeral'
import { DashboardNav } from "@/components/nav"
import { dashboardConfig } from "@/config/dashboard"
import { ImportSubscribersButton } from "@/components/import-subscribers-button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SubscriberOperations } from "@/components/subscriber-operations"
import { ExportSubscribersButton } from "@/components/export-subscribers-button"
import { formatLocation } from "@/lib/utils"
import { DeleteAllPendingButton } from "@/components/delete-all-pending-button"

 
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
  

  const subscribers = await db.subscriber.findMany({
    where: {
      newsletterId,
      status: SubscriberStatus.PENDING
    },
    select: {
      id: true,
      email: true,
      status: true,
      createdAt: true,
      clientOrigin: true,
      clientIPCity: true,
      clientIPCountry: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(subscribers)

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`${newsletter?.name} subscribers`}
        text="Pending subscribers."
      />
      <div className="grid gap-6">
        <DashboardNav items={dashboardConfig.sidebarNav} basePath={"/dashboard/" + newsletter.username} currentPath={"/dashboard/" + newsletter.username + "/pending"}/>
        <DeleteAllPendingButton newsletterId={newsletter.username} />
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="h-8 py-1 px-2 text-left w-[140px]">Email</TableHead>
              <TableHead className="h-8 py-1 px-2 text-left w-[80px]">Status</TableHead>
              <TableHead className="h-8 py-1 px-2 text-left w-[100px]">Date</TableHead>
              <TableHead className="h-8 py-1 px-1 text-center w-[40px]">URL</TableHead>
              <TableHead className="h-8 py-1 px-1 text-left w-[100px]">Location</TableHead>
              <TableHead className="h-8 py-1 px-1 text-center w-[24px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell className="py-1 text-left">{subscriber.email}</TableCell>
                <TableCell className="py-1 text-left">{subscriber.status}</TableCell>
                <TableCell className="py-1 text-left">{moment(subscriber.createdAt).format('YYYY-MM-DD')}</TableCell>
                <TableCell className="text-center w-[40px] py-1 px-1">{subscriber.clientOrigin}</TableCell>
                <TableCell className="text-left w-[100px] py-1 px-1">{formatLocation(subscriber)}</TableCell>
                <TableCell className="text-right py-1 pl-2 pr-1">
                  <SubscriberOperations subscriber={subscriber} newsletter={newsletter}/>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  )
}
