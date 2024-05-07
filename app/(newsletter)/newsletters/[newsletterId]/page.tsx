
import { notFound, redirect } from "next/navigation"
import { Newsletter, User } from "@prisma/client"

import { db } from "@/lib/db"
import { siteConfig } from "@/config/site"
import { SubscribeForm } from "@/components/subscirbe-form"
import { Metadata } from "next"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import moment from "moment"

async function getNewsletterForUser(username: Newsletter["username"]) {
  return await db.newsletter.findFirst({
    where: {
      username,
    },
  })
}

interface NewsletterPageProps {
  params: { newsletterId: string }
}
  
export async function generateMetadata(
  { params }: NewsletterPageProps
): Promise<Metadata> {  
  const newsletter = await getNewsletterForUser(params.newsletterId) 

  const title = newsletter?.name || newsletter?.username || 'Unknown'
  const description = newsletter?.description || ''

  const url = `https://${params.newsletterId}.recur.email`
  const author = newsletter?.fromName || newsletter?.username || 'Unknown'
  const domain = newsletter?.domain || 'recur.email'
  const emoji = newsletter?.emoji || '💌'

  const ogUrl = `${siteConfig.url}/api/og?author=${encodeURIComponent(author)}&domain=${encodeURIComponent(domain)}&emoji=${encodeURIComponent(emoji)}&title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
  return {
    title,
    description,
    authors: [{
      name: newsletter?.fromName || newsletter?.username || 'Unknown',
    }],
    keywords: newsletter?.keywords?.split(',').map((k)=> k.trim()) || [],
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
      creator: newsletter?.twitter || 'montaigne',
    },
    generator: "recur.email",
    alternates: {
      canonical: url,
      // types: {
      //     'application/rss+xml': [
      //       { url: 'rss.xml', title: 'rss' },
      //     ],
      //   },
    },
    openGraph: {
      title,
      description,
      url: url,
      images: [ogUrl],
    },
  };
}

export default async function NewsletterPage({ params }: NewsletterPageProps) {
  const newsletter = await getNewsletterForUser(params.newsletterId) 
  if(!newsletter || !newsletter.username) {
    notFound()
  }

  const emails = newsletter.webArchiveOnHomePage ? await db.email.findMany({
    where: {
      newsletterId: newsletter.id,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    }
  }): []
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
  const rssLink = newsletter.webArchive ?
    <Link
      title="Website"
      href={`https://${newsletter.username}.recur.email/feed.xml`}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "pl-2 pr-0 bg-transparent hover:bg-transparent h-8"
      )}>
    <Icons.rss className="mr-0 h-4 w-4" />
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
        {rssLink}
      </div>
      {emails.length > 0 ?  
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
      : <></>}
    </div>

  )
}
