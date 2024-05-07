
import { notFound, redirect } from "next/navigation"
import { Newsletter, User, Email } from "@prisma/client"

import { db } from "@/lib/db"

import moment from 'moment'
import { SubscribeForm } from "@/components/subscirbe-form"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"

async function getNewsletterForUser(username: Newsletter["username"]) {
  return await db.newsletter.findFirst({
    where: {
      username,
    },
  })
}

interface ArchivePageProps {
  params: { newsletterId: string }
}
  



export default async function ArchivePage({ params }: ArchivePageProps) {
  const newsletter = await getNewsletterForUser(params.newsletterId) 
  if(!newsletter || !newsletter.username) {
    notFound()
  }
  if(!newsletter) {
    notFound()
  }
  if(!newsletter.webArchive) {
    notFound()
  }
  
  const emails = await db.email.findMany({
    where: {
      newsletterId: newsletter.id,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    }
  })
  
  const twitterLink = newsletter.twitter ?
    <Link
      title="Twitter"
      href={`https://twitter.com/${newsletter.twitter}`}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "pl-2 pr-0 bg-transparent hover:bg-transparent h-8"
      )}>
    <Icons.twitter className="mr-0 h-4 w-4" />
    </Link>
  : <></>

  const websiteLink = newsletter.website ?
    <Link
      title="Website"
      href={newsletter.website}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "pl-2 pr-0 bg-transparent hover:bg-transparent h-8"
      )}>
    <Icons.link className="mr-0 h-4 w-4" />
    </Link>
    : <></>
  return (
    <div>
    <header className="text-center">
      <h1 className="text-xl mb-1 dark:text-gray-100">
      {newsletter?.name || newsletter?.username}
      </h1>
      <h2 className="font-bold text-l mb-4">{newsletter?.description || ""}</h2>
    </header>  
    
    <div className="divide-y">
      <SubscribeForm newsletterUsername={newsletter?.username} />
    </div>
    <div className="text-center">
      {twitterLink}
      {websiteLink}
    </div>
    <div className="divide-y">
      <ol>
      {emails.map((email) => (
        <li key={email.id} className="mb-2">
          <Link href={`/issues/${email.slug}`}>{email.subject}</Link>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-500">
            {moment(email.createdAt).format('YYYY-MM-DD HH:mm')}
            </span> 
          </div>
        </li>
        ))}
      </ol>
    </div>
  </div>

  )
}
