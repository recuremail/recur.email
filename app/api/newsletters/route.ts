import { getServerSession } from "next-auth/next"
import * as z from "zod"
import va from "@vercel/analytics"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { newsletterSetupSchema } from "@/lib/validations/schemas"

import {createMailServer} from '@/lib/emails'

export async function POST(req: Request) {
  try {
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

    

    const body = await req.json()
    const payload = newsletterSetupSchema.parse(body)

    const username = payload.username.toLowerCase()

    const {postmarkServer, inboundAddress, error } = await createMailServer(username)
    
    if(postmarkServer) { 

      console.log('aaa', postmarkServer)
      const newsletter = await db.newsletter.create({
        data: {
          username: username,
          name: payload.name,
          description: payload.description,
          userId: user.id,
          postmarkServerId: postmarkServer.ID,
          postmarkServer: postmarkServer,
          inboundAddress,
        }
      })
      va.track("newsletter.created");
      return new Response(JSON.stringify(newsletter))
    } else {
      console.log('cannot create newsletter', error)
    }
    
    return new Response(null, { status: 422})
  } catch (error) {
    console.log('cannot create newsletter', error)
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}
