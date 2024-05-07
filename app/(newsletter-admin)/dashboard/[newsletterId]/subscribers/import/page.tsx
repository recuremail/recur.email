import { notFound, redirect } from "next/navigation"
import { Newsletter, OutboundEmailStatus, User } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { db } from "@/lib/db"
import { DashboardNav } from "@/components/nav"
import { dashboardConfig } from "@/config/dashboard"


import { ImportSubscribersForm } from "@/components/import-subscribers-form"



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
  

  

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`${newsletter?.name} subcribers`}
        text="Import subscribers."
      />
      <div className="grid gap-6">
        <DashboardNav items={dashboardConfig.sidebarNav} basePath={"/dashboard/" + newsletter.username} currentPath={"/dashboard/" + newsletter.username + "/subscribers"}/>
        <ImportSubscribersForm newsletter={newsletter} />
      </div>
    </DashboardShell>
  )
}
