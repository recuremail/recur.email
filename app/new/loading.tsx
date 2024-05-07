import { DashboardHeader } from "@/components/header"
import { NewsletterItem } from "@/components/newsletter-item"
import { DashboardShell } from "@/components/shell"

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Newsletters" text="Manage your newsletters">
      </DashboardHeader>
      <div className="divide-border-200 divide-y rounded-md border">
        <NewsletterItem.Skeleton />
        <NewsletterItem.Skeleton />
        <NewsletterItem.Skeleton />
        <NewsletterItem.Skeleton />
        <NewsletterItem.Skeleton />
      </div>
    </DashboardShell>
  )
}
