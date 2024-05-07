import { z } from "zod"

import _ from "lodash"
import { db } from "@/lib/db"
import { Newsletter, SubscriberStatus } from "@prisma/client"


import { newSubscriberSchema } from "@/lib/validations/schemas"
import { sendConfirmationEmail } from "@/lib/emails"
import { Sub } from "@radix-ui/react-dropdown-menu"

import {  NextResponse, NextRequest, userAgent } from "next/server"
import { checkAndSaveIPAddressMeta } from "@/lib/quality"
import { sub } from "date-fns"

const routeContextSchema = z.object({
  params: z.object({
    newsletterId: z.string(),
  }),
})



export async function POST(
  req: NextRequest,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const origin = req.headers.get('origin') ?? ''
    console.log('step 1', origin)
    const ua = userAgent(req);
    console.log('ua', ua)
    const realIp = req.headers.get("x-real-ip")
    const forwardedFor = req.headers.get("x-forwarded-for")
    const vercelForwardedFor = req.headers.get("x-vercel-forwarded-for")
    const clientIPCountry = req.headers.get("x-vercel-ip-country")
    const clientIPCountryRegion = req.headers.get("x-vercel-ip-country-region")
    const clientIPCity = req.headers.get("x-vercel-ip-city")
    const clientIPLatitude = req.headers.get("x-vercel-ip-latitude")
    const clientIPLongitude = req.headers.get("x-vercel-ip-longitude")
    const clientIP = realIp || forwardedFor || vercelForwardedFor
    console.log('abc', realIp, forwardedFor, vercelForwardedFor)
    const { params } = routeContextSchema.parse(context)
    const body = await req.json()
    const payload = newSubscriberSchema.parse(body)
    const newsletter = await db.newsletter.findUnique({
      where: {
        username: params.newsletterId
      },
      select: {
        id: true,
        username: true,
        name: true,
        postmarkServer: true,
        fromName: true,
      }
    })

    if(newsletter) {

      const existingSubscriber = await db.subscriber.findFirst({
        where: {
          newsletterId: newsletter.id,
          email: payload.email as string
        }
      })

      if(existingSubscriber) {
        if (existingSubscriber.status == SubscriberStatus.VERIFIED) {
          return new Response(JSON.stringify({status: "already subscribed"}))
        }
        if (existingSubscriber.status == SubscriberStatus.INITIAL) {
          await sendConfirmationEmail(existingSubscriber.id, payload.email, newsletter)
          return new Response(JSON.stringify({status: "already subscribed"}))
        }
      }

      const subscriber = await db.subscriber.create({
        data: {
          newsletterId: newsletter.id,
          email: payload.email,
          status: SubscriberStatus.INITIAL,
          clientOrigin: origin,
          clientUserAgent: ua.ua,
          clientBrowser: ua.browser,
          clientEngine: ua.engine,
          clientOperatingSystem: ua.os,
          clientDevice: ua.device,  
          clientIsBot: ua.isBot,
          clientIP,
          clientIPCountry,
          clientIPCountryRegion,
          clientIPCity,
          clientIPLatitude,
          clientIPLongitude,
        }
      })
      if(clientIP) {
        // check if this is a honeypot
        const result = await checkAndSaveIPAddressMeta(subscriber.id, clientIP)
        if(result && result.honeypotIsFound) {
          return new Response(JSON.stringify({status: "success"}))
        }
      }
      

      
      await sendConfirmationEmail(subscriber.id, payload.email, newsletter)

      // note mark this subscriber as pending if no error
      await db.subscriber.update({
        where: {
          id: subscriber.id
        },
        data:{
          clientOrigin: origin,
          status: SubscriberStatus.PENDING
        }
      })
      return new Response(JSON.stringify({status: "success"}))
    }
    
    return new Response(JSON.stringify({status: "no newsletter"}),  { status: 404 })
  } catch (error) {
    console.log('cannot create subscriber', error)
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}




