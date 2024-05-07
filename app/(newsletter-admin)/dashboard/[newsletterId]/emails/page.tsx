import { notFound, redirect } from "next/navigation"
import { Newsletter, OutboundEmailStatus, User } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { db } from "@/lib/db"
import moment from 'moment'
import numeral from 'numeral'
import { DashboardNav } from "@/components/nav"
import { dashboardConfig } from "@/config/dashboard"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { EmailOperations } from "@/components/email-operations"

 
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
  

  const emails = await db.email.findMany({
    where: {
      newsletterId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      _count: {
        select: {
          outboundEmails: {
            where: {
              status: OutboundEmailStatus.SENT
            }
          }
        }
      }
    }
  })

  console.log(emails)
  return (
    <DashboardShell>
      <DashboardHeader
        heading={`${newsletter?.name} emails`}
        text="Sent emails to this newsletter."
      />
      <div className="grid gap-6">
        <DashboardNav items={dashboardConfig.sidebarNav} basePath={"/dashboard/" + newsletter.username} currentPath={"/dashboard/" + newsletter.username + "/emails"}/>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="h-8 py-1 px-2 w-[180px]">Email</TableHead>
              <TableHead className="h-8 py-1 px-2 text-center w-[60px]">Date</TableHead>
              <TableHead className="h-8 py-1 px-2 text-center w-[60px]">Sent To</TableHead>
              <TableHead className="h-8 py-1 px-1 text-center w-[24px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => (
              <TableRow key={email.id}>
                <TableCell className="py-1">{email.subject}</TableCell>
                <TableCell className="text-center py-1 px-2">{moment(email.createdAt).format('YYYY-MM-DD HH:mm')}</TableCell>
                <TableCell className="text-center py-1 px-2">{email._count.outboundEmails}</TableCell>
                <TableCell className="text-right py-1 pl-2 pr-1">
                  <EmailOperations email={email} newsletter={newsletter}/>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  )
}
