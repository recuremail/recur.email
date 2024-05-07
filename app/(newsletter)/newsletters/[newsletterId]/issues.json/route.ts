import { db } from "@/lib/db"
import { z } from "zod"
import { parse } from 'node-html-parser'


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
      const htmlNode = parseAnyHtml(email.htmlBody)
      // @ts-ignore
      email.htmlBody = htmlNode.querySelector('body').innerHTML
    })
    return new Response(JSON.stringify({
      newsletter,
      emails
    }))
  } catch (error) {
    return new Response(`Failed to get issues for the newsletter`, {
      status: 500,
    })
  }
}
