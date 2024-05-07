import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { EmptyPlaceholder } from "@/components/empty-placeholder"
import { DashboardHeader } from "@/components/header"
import { NewsletterCreateButton } from "@/components/newsletter-create-button"
import { NewsletterItem } from "@/components/newsletter-item"
import { DashboardShell } from "@/components/shell"
import _ from 'lodash'
import voca from 'voca'
import { Sub } from "@radix-ui/react-dropdown-menu"
import { OutboundEmailStatus, SubscriberStatus } from "@prisma/client"

export const metadata = {
  title: "Dashboard",
}

async function refetchUser(userId: string) {
  const user = await db.user.findUnique({
    where: {
      id: userId
    }
  })
  return user
}


export default async function DashboardPage() {
  let user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login")
  }
  user = await refetchUser(user.id)
  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login")
  }
  // if(!user.username) {
  //   redirect("/dashboard/setup")
  // }
  
  const newsletters = await db.newsletter.findMany({
    where: {
      userId: user.id
    },
    include: {
      _count: {
        select: {
          subscribers: {
            where: {
              status: SubscriberStatus.VERIFIED
            }
          },
          emails: {
            where: {
              deletedAt: null
            }
          },
          outboundEmails: {
            where: {
              status: OutboundEmailStatus.SENT
            }
          }
        }
      }
    }
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="Newsletters" text="All newsletters">
        <NewsletterCreateButton/>
      </DashboardHeader>
      <div>
        {newsletters?.length ? (
          <div className="divide-y divide-border rounded-md border">
            {newsletters.map((newsletter) => (
              <NewsletterItem key={newsletter.id} newsletter={newsletter} subscribersCount={newsletter._count.subscribers} emailsCount={newsletter._count.emails} sentEmailsCount={newsletter._count.outboundEmails}
                />
            ))}
          </div>
        ) : (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="post" />
            <EmptyPlaceholder.Title>No newsletters yet</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You don&apos;t have any newsletters yet. Add your first newsletter.
            </EmptyPlaceholder.Description>
          </EmptyPlaceholder>
        )}
      </div>
    </DashboardShell>
  )
}
