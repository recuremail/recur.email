import { db } from "@/lib/db"

import { findSendingEmailMatch } from "@/lib/emails"
import { OutboundEmailStatus, SubscriberStatus } from "@prisma/client"
import { sub } from "date-fns"
import _ from "lodash"

export const revalidate = 0
// 5 minutes
export const maxDuration = 300

export async function GET() {
  try {
    console.log('check emails status')
    // DO limit 500
    const pendingEmails = await db.outboundEmail.findMany({
      where: {
        status: OutboundEmailStatus.SENDING,
      },
      include: {
        newsletter: true,
        subscriber: true
      },
      take: 500,
      orderBy: {
        createdAt: 'desc'
      }
    })
    console.log('pendingEmails', pendingEmails.length)
    for(const pendingEmail of pendingEmails) {
      const { newsletter, subscriber } = pendingEmail
      // console.log('pendingEmail start', pendingEmail.id, subscriber.email)
      const tokens = (newsletter.postmarkServer || {})['ApiTokens'] || []
      const apiToken = tokens[0] || ""
      if(apiToken && subscriber.email && pendingEmail.id) {
        const {messageDetails} = await findSendingEmailMatch(apiToken, subscriber.email, pendingEmail.id)
        // console.log('message details', messageDetails)
        if(messageDetails && messageDetails.Status == 'Sent') {
          try {
            await db.outboundEmail.update({
              where: {
                id: pendingEmail.id
              },
              data: {
                status: OutboundEmailStatus.SENT,
                postmarkMessageId: messageDetails.MessageID,
                postmarkTo: messageDetails.To && messageDetails.To[0] && messageDetails.To[0].Email ? messageDetails.To[0].Email : '',
                postmarkStatusCheckedAt: new Date()
              }
            })
          } catch (error) {
            console.log('error updating email', error)
          }
        } else if(messageDetails){
          console.log('status is not sent', messageDetails)
        }   
      } else {
        console.log('no api token or email', apiToken, subscriber.email)
      }
    }
    console.log('finished checking emails status')
    return new Response(JSON.stringify({}))
  } catch (error) {
    console.log('error sending mails', error)
    return new Response(null, { status: 500 })
  }
}

