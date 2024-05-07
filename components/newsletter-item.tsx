import Link from "next/link"
import { Newsletter } from "@prisma/client"

import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

import { Badge } from "@/components/ui/badge"
import moment from "moment"

interface NewsletterItemProps {
  newsletter: Pick<Newsletter, "id" | "name" | "username" | "createdAt">
  subscribersCount: Number 
  emailsCount: Number 
  sentEmailsCount: Number
}

export function NewsletterItem({ newsletter, subscribersCount, emailsCount, sentEmailsCount }: NewsletterItemProps) {
 
  return (
    <div className="flex items-center justify-between p-4">
      <div className="grid gap-1">
        <Link
          href={`/dashboard/${newsletter.username}`}
          className="font-semibold hover:underline"
        >
          {newsletter.name || newsletter.username}
        </Link>
        <div className="text-sm text-muted-foreground">
        <span className="text-sm text-muted-foreground mr-2">{String(subscribersCount)} subscribers</span>
        <span className="text-sm text-muted-foreground mr-2">{String(emailsCount)} emails</span>
        <span className="text-sm text-muted-foreground mr-2">{String(sentEmailsCount)} outbound emails</span>
        <span className="text-sm text-muted-foreground mr-2">{moment(newsletter.createdAt).format('YYYY-MM-DD')} start date</span>
          {/* {formatDate(note.createdAt?.toDateString())} 
          <span className="text-sm text-muted-foreground mx-2">{viewsCount} views</span>
          <span className="text-sm text-muted-foreground mx-2">{subscribersCount} subscribers</span>
          {noteBadge} */}
        </div>
      </div>
      {/* <NoteOperations note={note} /> */}
    </div>
  )
}

NewsletterItem.Skeleton = function NewsletterItemSkeleton() {
  return (
    <div className="p-4">
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}
