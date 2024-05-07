import { notFound, redirect } from "next/navigation"
import { Newsletter, OutboundEmailStatus, Email, User } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { NewsletterSettingsForm } from "@/components/newsletter-settings-form"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Mail } from "lucide-react"
import moment from "moment"
import numeral from 'numeral'
import { Button } from "@/components/ui/button"



async function getNewsletterEmailForUser(issueId: Email["id"], username: Newsletter["username"], userId: User["id"]) {
  return await db.email.findUnique({
    where: {
      id: issueId,
      newsletter: {
        username,
        userId
      }
    },
    include: {
      newsletter: true
    }
  })
}

interface NewsletterIssuePageProps {
  params: { newsletterId: string, issueId: string }
}
  


export default async function NewsletterIssuePage({ params }: NewsletterIssuePageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login")
  }

  
  const email = await getNewsletterEmailForUser(params.issueId, params.newsletterId, user.id)

  if (!email || !email.newsletter) {
    notFound()
  }

  
  return (
    <DashboardShell>
      <DashboardHeader
        heading={email.subject}
        text="Newsletter Issue Stats and Settings"
      />
      <div className="grid gap-10">
      
      </div>
    </DashboardShell>
  )
}
