import { getServerSession } from "next-auth"
import * as z from "zod"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

import voca from 'voca'
import { SubscriberStatus } from "@prisma/client"

const routeContextSchema = z.object({
  params: z.object({
    newsletterId: z.string(),
    emailId: z.string(),
  }),
})


export async function DELETE(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const session = await getServerSession(authOptions)
    if(!session || !session?.user?.id) {
      return new Response(null, { status: 401 })
    }
    // Validate the route params.
    const { params } = routeContextSchema.parse(context)

    const newsletter = await db.newsletter.findUnique({
      where: {
        username: params.newsletterId,
        userId: session?.user?.id
      }
    })
    if(!newsletter) {
      return new Response(null, { status: 404 })
    }

    const email = await db.email.findFirst({
      where: {
        id: params.emailId,
        newsletterId: newsletter.id,
      }
    })
    if(!email) {
      return new Response(null, { status: 404 })
    }

    // mark email as deleted
    await db.email.update({
      where: {
        id: params.emailId,
      }, data: {
        deletedAt: new Date()
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
