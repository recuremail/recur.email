import { getServerSession } from "next-auth/next"
import * as z from "zod"
import va from "@vercel/analytics"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { newsletterUpdateSchema } from "@/lib/validations/schemas"
import { updateMailServer, getServerMessageStreams, editServerMessageStreams } from '@/lib/emails'

const routeContextSchema = z.object({
  params: z.object({
    newsletterId: z.string(),
  }),
})


export async function PATCH(req: Request,
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
    if (!newsletter || !newsletter.postmarkServerId) {
      return new Response("Not found", { status: 404 })
    }

    const body = await req.json()
    const payload = newsletterUpdateSchema.parse(body)
    console.log('payload', payload)
    const { postmarkServer, error } = await updateMailServer(newsletter.postmarkServerId, payload.trackOpens, payload.trackLinks)
    console.log('postmarkServer', postmarkServer, error)
    if(!error && postmarkServer) {
      const tokens = (newsletter.postmarkServer || {})['ApiTokens'] || []
      const apiToken = tokens[0] || ""
      await editServerMessageStreams(apiToken, 'broadcast')
      const postmarkMessageStreamsResponse = await getServerMessageStreams(apiToken)
      const postmarkMessageStreams = postmarkMessageStreamsResponse['MessageStreams'] || []
      await db.newsletter.update({
        where: {
          username: params.newsletterId
        },
        data: {
          ...payload,
          postmarkServer,
          postmarkMessageStreams,
        }
      })
      return new Response(null, { status: 200 })
    }
    return new Response(JSON.stringify(error.issues), { status: 422 })
  } catch (error) {
    console.log('cannot update newsletter', error)
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
