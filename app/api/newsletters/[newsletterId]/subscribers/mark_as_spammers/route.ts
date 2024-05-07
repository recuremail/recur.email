import { getServerSession } from "next-auth/next"
import * as z from "zod"
import va from "@vercel/analytics"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { subscribersImportSchema } from "@/lib/validations/schemas"
import { sub } from "date-fns"
import { parse } from 'csv-parse/sync'
import { SubscriberStatus } from "@prisma/client"
import { findPotentialSpammers } from "@/lib/planetscale"

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
      console.log('no access to the newsletter', params.newsletterId)
      return new Response(null, { status: 403 })
    }
    const session = await getServerSession(authOptions)

    if (!session) {
      console.log('no session')
      return new Response("Unauthorized", { status: 403 })
    }

    const { user } = session

    if (!user) {
      console.log('no user')
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

    const spammers = await findPotentialSpammers(newsletter.id)
    const ids = spammers.map((s) => s.id)
    await db.subscriber.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        status: SubscriberStatus.SPAMMER_DELETED,
        markedAsSpammerAt: new Date(),
        markedAsSpammerByUserId: user.id
      }
    })

    
    return new Response(null, { status: 200 })
  } catch (error) {
    console.log('cannot import subscribers', error)
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}


async function verifyCurrentUserHasAccessToNewsletter(newsletterUsername: string) {
  const session = await getServerSession(authOptions)
  console.log('session user id', session?.user.id)
  const count = await db.newsletter.count({
    where: {
      username: newsletterUsername,
      userId: session?.user.id,
    },
  })

  return count > 0
}
