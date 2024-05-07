import { z } from "zod"

import _ from "lodash"
import { db } from "@/lib/db"
import { Newsletter, SubscriberStatus } from "@prisma/client"
import {  NextResponse, NextRequest, userAgent } from "next/server"
const amrhextotext = require('amrhextotext')

import { sendConfirmationEmail } from "@/lib/emails"
import { checkAndSaveIPAddressMeta } from "@/lib/quality"


const routeContextSchema = z.object({
  params: z.object({
    newsletterId: z.string(),
  }),
})

export async function POST(req: NextRequest, context: z.infer<typeof routeContextSchema>) {
  try {
    const origin = req.headers.get('origin') ?? ''
    console.log('step 1. origin', origin)
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
    console.log('step 2')
    const data = await req.formData();
    console.log('subscribe data', data)
    console.log('step 3')
    const subscriberEmail = data.get('email') as string
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
    console.log('step 4', newsletter, subscriberEmail)
    if(newsletter && subscriberEmail) {
      const existingSubscriber = await db.subscriber.findFirst({
        where: {
          newsletterId: newsletter.id,
          email: subscriberEmail as string
        }
      })

      // NOTE if all subscribed, just tell them they are subscribed
      // otherwise resend email
      // otherwise create new one

      let subscriberId: string = ""
      if(!existingSubscriber) {
        const subscriber = await db.subscriber.create({
          data: {
            newsletterId: newsletter.id,
            email: subscriberEmail,
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
        subscriberId = subscriber.id
      } else {
        subscriberId = existingSubscriber.id
        if(existingSubscriber.status === SubscriberStatus.VERIFIED) {
          const destinationUrl = new URL("/subscribed", new URL(req.url).origin);
          const response = NextResponse.redirect(destinationUrl, { status: 302 });
          return response;
        }
      }

      if(subscriberId){
        if(clientIP) {
          // check if this is a honeypot
          const result = await checkAndSaveIPAddressMeta(subscriberId, clientIP)
          if(result && result.honeypotIsFound) {
            const destinationUrl = new URL("/subscription-pending", new URL(req.url).origin);
            const response = NextResponse.redirect(destinationUrl, { status: 302 });
            return response;
          }
        }
        const subscriberHashId = amrhextotext.textToHex(subscriberId)
      
        const tokens = (newsletter.postmarkServer || {})['ApiTokens'] || []
        const apiToken = tokens[0] || ""
        await sendConfirmationEmail(subscriberId, subscriberEmail, newsletter)
        
        // note mark this subscriber as pending if no error
        await db.subscriber.update({
          where: {
            id: subscriberId
          },
          data:{
            clientOrigin: origin,
            status: SubscriberStatus.PENDING
          }
        })
      } else {
        console.log('no subscriber id')
      }
      
      const destinationUrl = new URL("/subscription-pending", new URL(req.url).origin);
      const response = NextResponse.redirect(destinationUrl, { status: 302 });
      return response;
    }
    return new Response(JSON.stringify({status: "no newsletter"}))
  } catch (error) {
    console.log('cannot subscribe', error)
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}

