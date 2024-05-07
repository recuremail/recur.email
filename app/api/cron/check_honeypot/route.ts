import { db } from "@/lib/db"
import { queryHoneypotIP } from "@/lib/honeypot"

import { findSendingEmailMatch, findServerSubscriberOpens, findMessageEvents } from "@/lib/emails"
import { OutboundEmailStatus, Prisma, SubscriberStatus } from "@prisma/client"
import { sub } from "date-fns"
import _ from "lodash"
import { checkAndSaveIPAddressMeta } from "@/lib/quality"

export const revalidate = 0
// 5 minutes
export const maxDuration = 300

export async function GET() {
  try {
    console.log('check subscribers ips')
    const subsribers = await db.subscriber.findMany({
      where: {
        status: SubscriberStatus.PENDING,
        honeypotLastCheckedAt: null,
        clientIP: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        clientIP: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1000
    })
    console.log('subsribers to check', subsribers)

    for(const subscriber of subsribers) {
      if(subscriber.clientIP) {
        await checkAndSaveIPAddressMeta(subscriber.id, subscriber.clientIP)
      }
    }
      
    console.log('finished checking emails status')
    return new Response(JSON.stringify({}))
  } catch (error) {
    console.log('error sending mails', error)
    return new Response(null, { status: 500 })
  }
}

