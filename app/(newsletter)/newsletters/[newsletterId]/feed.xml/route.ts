import { db } from "@/lib/db"
import { z } from "zod"
import { parse } from 'node-html-parser'
import RSS from "rss"

const routeContextSchema = z.object({
  params: z.object({
    newsletterId: z.string(),
  }),
})

function parseAnyHtml(html: string) {
  const root = parse(html)
  return root
}


export async function GET(req: Request, context: z.infer<typeof routeContextSchema>) {
  try {
    // Validate the route params.
    const { params } = routeContextSchema.parse(context)
    const newsletter = await db.newsletter.findFirst({
      where: {
        username: params.newsletterId
      },
      select: {
        id: true,
        name: true,
        username: true,
        description: true,        
        webArchive: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    })
    if(!newsletter || !newsletter.username) {
      return new Response(null, { status: 404 })
    }
    if(!newsletter) {
      return new Response(null, { status: 404 })
    }
    if(!newsletter.webArchive) {
      return new Response(null, { status: 404 })
    }
    
    const emails = await db.email.findMany({
      where: {
        newsletterId: newsletter.id,
        deletedAt: null,
      },
      select: {
        id: true,
        slug: true,
        subject: true,
        textBody: true,
        htmlBody: true,
        createdAt: true,
        deletedAt: true,
      }
    })
    emails.forEach((email) => {
      if(email.htmlBody) {
        const htmlNode = parseAnyHtml(email.htmlBody)
        if(htmlNode) {
          const bodyNode = htmlNode.querySelector('body')
          if(bodyNode) {
            email.htmlBody = bodyNode.innerHTML
          }
        }
      }
    })
    const host = `https://${newsletter.username}.recur.email`
    const feed = new RSS({
      title: newsletter.name || '',
      description: newsletter.description || '',
      site_url: `${host}`,
      feed_url: `${host}/feed.xml`,
      copyright: '',
      language: '',
      pubDate: '',
    });
    emails.map((email) => {
      feed.item({
        title: email.subject,
        guid: `${host}/${email.slug}`,
        url: `${host}/${email.slug}`,
        date: email.createdAt,
        description: email.htmlBody || email.textBody,
        author: newsletter.user.name || newsletter.user.email || '',
        categories: [],
      });
    });
    return new Response(feed.xml({ indent: true }), {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('error', error)
    return new Response(`Failed to get issues for the newsletter`, {
      status: 500,
    })
  }
}
