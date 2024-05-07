import { getServerSession } from "next-auth/next"
import * as z from "zod"
import va from "@vercel/analytics"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { subscribersImportSchema } from "@/lib/validations/schemas"
import { sub } from "date-fns"
import { parse } from 'csv-parse/sync'
import { SubscriberStatus } from "@prisma/client"

const routeContextSchema = z.object({
  params: z.object({
    newsletterId: z.string(),
  }),
})


export async function POST(req: Request,
  context: z.infer<typeof routeContextSchema>) {
  try {
    // Validate route params.
    const { params } = routeContextSchema.parse(context)

    // Check if the user has access to this post.
    if (!(await verifyCurrentUserHasAccessToNewsletter(params.newsletterId))) {
      return new Response(null, { status: 403 })
    }
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response("Unauthorized", { status: 403 })
    }

    const { user } = session

    if (!user) {
      return new Response("Unauthorized", { status: 403 })
    }
    const dbUser = await db.user.findUnique({
      where: {
        id: user.id
      }
    })
    if (!dbUser) {
      return new Response("Unauthorized", { status: 403 })
    }
    const newsletter = await db.newsletter.findUnique({
      where: {
        username: params.newsletterId
      }
    })
    if (!newsletter) {
      return new Response("Not found", { status: 404 })
    }

    const body = await req.json()
    const payload = subscribersImportSchema.parse(body)
    console.log('payload', payload)
    // const subscribersLines = (payload.subscribersText||'').split('\n')
    // if(subscribersLines.length < 2) {
    //   return new Response('Invalid data', { status: 422 })
    // }
    const records = parse(payload.subscribersText||'', {
      columns: true,
      skip_empty_lines: true
    });
    console.log('records', records)
    if(records.length < 1) {
      return new Response('Invalid data', { status: 422 })
    }
    const firstRecord = records[0]
    if(!firstRecord['email']) {
      return new Response('Invalid data', { status: 422 })
    }
    const subscribers = records.map((record: any) => {
      return {
        newsletterId: newsletter.id,
        email: record['email'].trim(),
        createdAt: record['date'] ? new Date(record['date'].trim()) : new Date(),
        status: SubscriberStatus.VERIFIED,
        importedAt: new Date(),
        verifiedByUserId: user.id
      }
    })
    const dbResult = await db.subscriber.createMany({
      data: subscribers,
      skipDuplicates: true
    })
    console.log('dbResult', dbResult)

    
    return new Response(null, { status: 200 })
  } catch (error) {
    console.log('cannot import subscribers', error)
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}


async function verifyCurrentUserHasAccessToNewsletter(newsletterId: string) {
  const session = await getServerSession(authOptions)
  const count = await db.newsletter.count({
    where: {
      username: newsletterId,
      userId: session?.user.id,
    },
  })

  return count > 0
}
