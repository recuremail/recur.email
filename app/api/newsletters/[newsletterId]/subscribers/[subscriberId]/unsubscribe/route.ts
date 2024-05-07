import { getServerSession } from "next-auth"
import * as z from "zod"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

import voca from 'voca'
import { SubscriberStatus } from "@prisma/client"

const routeContextSchema = z.object({
  params: z.object({
    newsletterId: z.string(),
    subscriberId: z.string(),
  }),
})

export async function DELETE(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    // Validate the route params.
    const { params } = routeContextSchema.parse(context)

    // Check if the user has access to this post.
    if (!(await verifyCurrentUserHasAccessToNewsletter(params.newsletterId))) {
      return new Response(null, { status: 403 })
    }

    const newsletter = await db.newsletter.findUnique({
      where: {
        username: params.newsletterId
      }
    })
    if(!newsletter) {
      return new Response(null, { status: 404 })
    }


    const subscriber = await db.subscriber.findFirst({
      where: {
        id: params.subscriberId,
        newsletterId: newsletter.id
      }
    })
    if(!subscriber) {
      return new Response(null, { status: 404 })
    }

    // unsubscribe the subscriber
    await db.subscriber.update({
      where: {
        id: params.subscriberId,
      }, data: {
        status: SubscriberStatus.UNSUBSCRIBED,
        unsubscribedAt: new Date()
      }
    })

    return new Response(null, { status: 204 })
  } catch (error) {
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
