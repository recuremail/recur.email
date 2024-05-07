import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { UserNameForm } from "@/components/user-name-form"
import { UserUrlsForm } from "@/components/user-urls-form"
import { User } from "@prisma/client"
import { db } from "@/lib/db"

export const metadata = {
  title: "Settings",
  description: "Manage account and settings.",
}

export default async function SettingsPage() {
  let user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login")
  }
  user = await db.user.findUnique({
    where: {
      id: user.id
    }
  })
  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login")
  }
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage account and settings."
      />
      <div className="grid gap-10">
        <UserNameForm user={{ id: user.id, name: user.name || ""}} />
        <UserUrlsForm user={{ id: user.id, url: user.url || "", twitter: user.twitter || "" }} />
      </div>
    </DashboardShell>
  )
}
