
import { notFound, redirect } from "next/navigation"
import { Newsletter, User, Email } from "@prisma/client"

import { db } from "@/lib/db"

import moment from 'moment'
import voca from 'voca'
import { ht } from "date-fns/locale"
async function getEmail(slug: Email["slug"]) {
  return await db.email.findFirst({
    where: {
      slug,
    },
    include: {
      newsletter: {
        include: {
          user: true
        }
      }
    }
  })
}

interface EmailPageProps {
  params: { newsletterId: string, slugId: string }
}
  


export default async function EmailPage({ params }: EmailPageProps) {
  const email = await getEmail(params.slugId) 
  if(!email) {
    notFound()
  }
  if(!email.newsletter.webArchive && !email.newsletter.webArchiveOnHomePage) {
    notFound()
  }
  let html = (email.htmlBody || email.textBody).trim()
  html = html.replace(`<meta http-equiv="Content-Type" content="text/xhtml; charset=utf-8">`, '')
  html = html.replace(`<meta http-equiv="content-type" content="text/html; charset=utf-8">`, '')
  html = html.trim()
  if(html.startsWith('<!DOCTYPE html>')) {
    html = html.replace(`<!DOCTYPE html>`, '')
    html = html.trim()
  }
  if(html.startsWith('<html>')) {
    html = html.replace(`<html>`, '')
    html = html.trim()
  }
  if(html.startsWith('<head>')) {
    html = html.replace(`<head>`, '')
    html = html.trim()
  }
  html = html.replace(`<head>`, '')
  html = html.replace(`</head>`, '')
  html = html.replace(`<body>`, '')
  html = html.trim()
  if(html.endsWith('</html>')) {
    html = html.replace(`</html>`, '')
    html = html.trim()
  }
  if(html.endsWith('</body>')) {
    html = html.replace(`</body>`, '')
    html = html.trim()
  }
  html = html.trim()
  console.log("hello", html)
  return (
    <div>
      <header className="text-left">
        <h1 className="text-xl mb-1 dark:text-gray-100 font-medium">
        {email.subject}
        </h1>
        {/* <h2 className="font-bold text-l mb-4">Some meta info</h2> */}
      </header>  
      
      <p className="font-mono flex text-xs text-gray-500 dark:text-gray-500">
        <span className="grow">
          <span itemProp="datePublished">{moment(email.createdAt).format('YYYY-MM-DD HH:mm')}</span>
          <meta itemProp="dateCreated" content={moment(email.createdAt).format('YYYY-MM-DD HH:mm')} />
          <meta itemProp="dateModified" content={moment(email.updatedAt).format('YYYY-MM-DD HH:mm')} />
        </span>
        <span>
          {/* <span className="pr-2">{viewsCount} {viewsCountLabel}</span>
          <span>{versionsCount} {versionsCountLabel}</span> */}
        </span>
      </p>
      <section itemProp="articleBody" className="prose dark:prose-dark mt-3 dark:text-gray-100" dangerouslySetInnerHTML={{__html: html}}>
      </section>
    </div>

  )
}
