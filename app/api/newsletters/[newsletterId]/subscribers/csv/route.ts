import { getServerSession } from "next-auth/next"
import * as z from "zod"
import va from "@vercel/analytics"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { SubscriberStatus } from "@prisma/client"
import { newsletterUpdateSchema } from "@/lib/validations/schemas"
import {
  updateMailServer,
  getServerMessageStreams,
  editServerMessageStreams,
} from "@/lib/emails"
import moment from "moment"

const routeContextSchema = z.object({
  params: z.object({
    newsletterId: z.string(),
  }),
})

export async function GET(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
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
        id: user.id,
      },
    })
    if (!dbUser) {
      return new Response("Unauthorized", { status: 403 })
    }
    const newsletter = await db.newsletter.findUnique({
      where: {
        username: params.newsletterId,
      },
    })
    if (!newsletter || !newsletter.postmarkServerId) {
      return new Response("Not found", { status: 404 })
    }

    const subsribers = await db.subscriber.findMany({
      where: {
        newsletterId: newsletter.id,
        status: SubscriberStatus.VERIFIED,
      },
    })
    const csvRows = subsribers.map((s) => {
      return `${s.email},${s.status},${moment(s.createdAt).format()},${moment(
        s.updatedAt
      ).format()}`
    })
    const csv = `email, status, created_at, updated_at\n` + csvRows.join("\n")
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=subscribers.csv`,
      },
    })
  } catch (error) {
    console.log("cannot export subscribers", error)
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
