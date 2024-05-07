import { db } from "@/lib/db"

import { findSendingEmailMatch, findServerSubscriberOpens, findMessageEvents } from "@/lib/emails"
import { OutboundEmailStatus, Prisma, SubscriberStatus } from "@prisma/client"
import { sub } from "date-fns"
import _ from "lodash"

export const revalidate = 0
// 5 minutes
export const maxDuration = 300

export async function GET() {
  try {
    console.log('check subscribers opens')
    // DO limit 1
    // TODO need to iterate on all newsletters
    const newsletterToCheck = await db.newsletter.findFirst({
      where: {
        username: 'montaigne-users'
        // postmarkServerId: {
        //   not: null
        // },
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
      const tokens = (newsletterToCheck.postmarkServer || {})['ApiTokens'] || []
      const apiToken = tokens[0] || ""
      const outboundEmails = await db.outboundEmail.findMany({
        where: {
          newsletterId: newsletterToCheck.id,
          postmarkStatusCheckedAt: null,
          postmarkMessageId: {
            not: null
          }
        },
        orderBy: {
          postmarkStatusCheckedAt: 'asc'
        },
        take: 200
      })
      for(const outboundEmail of outboundEmails) {
        if(outboundEmail.postmarkMessageId) {
          const {events, error, receivedAt} = await findMessageEvents(apiToken, outboundEmail.postmarkMessageId)
          console.log('resp', events)
          const Bounced = events.find(event => event['Type'] === 'Bounced')
          const LinkClicked = events.find(event => event['Type'] === 'LinkClicked')
          const Opened = events.find(event => event['Type'] === 'Opened')
          const Transient = events.find(event => event['Type'] === 'Transient')
          const Delivered = events.find(event => event['Type'] === 'Delivered')
          const SubscriptionChanged = events.find(event => event['Type'] === 'SubscriptionChanged')

          const updateRes = await db.outboundEmail.update({
            where: {
              id: outboundEmail.id
            },
            data: {
              postmarkStatusCheckedAt: new Date(),
              postmarkEvents: events,
              postmarkReceivedAt: receivedAt,
              postmarkDeliveredAt: Delivered ? Delivered['ReceivedAt'] : null,
              postmarkOpenedAt: Opened ? Opened['ReceivedAt'] : null,
              postmarkBouncedAt: Bounced ? Bounced['ReceivedAt'] : null,
              postmarkTransientAt: Transient ? Transient['ReceivedAt'] : null,
              postmarkLinkClickedAt: LinkClicked ? LinkClicked['ReceivedAt'] : null,
              postmarkSubscriptionChangedAt: SubscriptionChanged ? SubscriptionChanged['ReceivedAt'] : null,
            }
          })
          console.log('updateRes', updateRes)
        }
        
      }
      // const resp1 = await findServerSubscriberOpens(apiToken, 'podviaznikov@gmail.com')
      // console.log('resp1', resp1)
      // const resp2 = await findServerSubscriberOpens(apiToken, 'airyland@qq.com')
      // console.log('resp2', resp2)
      // const resp3 = await findServerSubscriberOpens(apiToken, 'dixin1981@gmail.com')
      // console.log('resp3', resp3)
    }

    // if(newsletterToCheck) {
    //   await db.newsletter.update({
    //     where: {
    //       id: newsletterToCheck.id
    //     },
    //     data: {
    //       checkSuppressionsAt: new Date()
    //     }
    //   })
    //   if(newsletterToCheck._count.outboundEmails > 0) {
        
    //     const tokens = (newsletterToCheck.postmarkServer || {})['ApiTokens'] || []
    //     const apiToken = tokens[0] || ""
    //     const resp = await findServerSuppressions(apiToken, 'broadcast')
    //     if(resp && resp.suppressions) {
    //       const suppressions = resp.suppressions
    //       for(const suppression of suppressions) {
    //         const email = suppression['EmailAddress']
    //         if(email) {
    //           const subscriber = await db.subscriber.findFirst({
    //             where: {
    //               email: email,
    //               newsletterId: newsletterToCheck.id,
    //             }
    //           })
    //           console.log('email', email, suppression, subscriber)
    //           if(subscriber && subscriber.suppression == null) {
    //             const status = suppression['SuppressionReason'] === 'HardBounce' ? SubscriberStatus.BOUNCED : SubscriberStatus.SPAM_COMPLAINED
    //             const bouncedAt = suppression['SuppressionReason'] === 'HardBounce' ? suppression['CreatedAt'] : null
    //             await db.subscriber.update({
    //               where: {
    //                 id: subscriber.id
    //               },
    //               data: {
    //                 status: status,
    //                 suppression: suppression,
    //                 bouncedAt: bouncedAt
    //               }
    //             })
    //           }
    //         }
    //       }
    //     }
    //     // console.log('subpressions', suppressions)
    //   }
    // }
    
    console.log('finished checking emails status')
    return new Response(JSON.stringify({}))
  } catch (error) {
    console.log('error sending mails', error)
    return new Response(null, { status: 500 })
  }
}

