import { db } from "@/lib/db"

import { findSendingEmailMatch, findServerSuppressions } from "@/lib/emails"
import { OutboundEmailStatus, Prisma, SubscriberStatus } from "@prisma/client"
import { sub } from "date-fns"
import _ from "lodash"

export const revalidate = 0
// 5 minutes
export const maxDuration = 300

export async function GET() {
  try {
    console.log('check suppressions')
    // DO limit 1
    const newsletterToCheck = await db.newsletter.findFirst({
      where: {
        postmarkServerId: {
          not: null
        },
      },
      include: {
        _count: {
          select: { outboundEmails: true },
        },
      },
      orderBy: {
        checkSuppressionsAt: 'asc'
      },
      take: 1
    })
    console.log('newsletterToCheck', newsletterToCheck)

    if(newsletterToCheck) {
      await db.newsletter.update({
        where: {
          id: newsletterToCheck.id
        },
        data: {
          checkSuppressionsAt: new Date()
        }
      })
      if(newsletterToCheck._count.outboundEmails > 0) {
        
        const tokens = (newsletterToCheck.postmarkServer || {})['ApiTokens'] || []
        const apiToken = tokens[0] || ""
        const resp = await findServerSuppressions(apiToken, 'broadcast')
        if(resp && resp.suppressions) {
          const suppressions = resp.suppressions
          for(const suppression of suppressions) {
            const email = suppression['EmailAddress']
            if(email) {
              const subscriber = await db.subscriber.findFirst({
                where: {
                  email: email,
                  newsletterId: newsletterToCheck.id,
                }
              })
              console.log('email', email, suppression, subscriber)
              if(subscriber && subscriber.suppression == null) {
                const status = suppression['SuppressionReason'] === 'HardBounce' ? SubscriberStatus.BOUNCED : SubscriberStatus.SPAM_COMPLAINED
                const bouncedAt = suppression['SuppressionReason'] === 'HardBounce' ? suppression['CreatedAt'] : null
                await db.subscriber.update({
                  where: {
                    id: subscriber.id
                  },
                  data: {
                    status: status,
                    suppression: suppression,
                    bouncedAt: bouncedAt
                  }
                })
              }
            }
          }
        }
        // console.log('subpressions', suppressions)
      }
    }
    
    console.log('finished checking emails status')
    return new Response(JSON.stringify({}))
  } catch (error) {
    console.log('error sending mails', error)
    return new Response(null, { status: 500 })
  }
}

