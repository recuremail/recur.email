
import { db } from "@/lib/db"

import { sendBatchMail } from "@/lib/emails"
import { Email, OutboundEmailStatus, SubscriberStatus } from "@prisma/client"
import { sub } from "date-fns"
const amrhextotext = require('amrhextotext')
import _ from "lodash"

export const revalidate = 0
// 5 minutes
export const maxDuration = 300

export async function GET() {
  try {
    console.log('send newsletter emails')
    // @ts-ignore
    db.$on('query', (e) => {
      // @ts-ignore
      console.log('Query: ' + e.query)
      // @ts-ignore
      console.log('Params: ' + e.params)
      // @ts-ignore
      console.log('Duration: ' + e.duration + 'ms')
    })
    const pendingOutboundEmails = await db.outboundEmail.findMany({
      where: {
        status: OutboundEmailStatus.PENDING,
        subscriber: {
          status: SubscriberStatus.VERIFIED
        }
      },
      include: {
        newsletter: {
          include: {
            user: true
          }
        },
        email: true,
        subscriber: true
      },
      // the real limit for postmark is 500
      take: 500
    })
    const ids = pendingOutboundEmails.map((email) => email.id)
    await db.outboundEmail.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        status: OutboundEmailStatus.SENDING
      }
    })

    const postmarkEmails = pendingOutboundEmails.map((email) => {
      if(!email.email) {
        return null
      }
      const { newsletter, email: { subject, htmlBody, textBody }, subscriber } = email
      if(!subscriber || subscriber.status != SubscriberStatus.VERIFIED) {
        return null
      }
      const tokens = (newsletter.postmarkServer || {})['ApiTokens'] || []
      const apiToken = tokens[0] || ""
      const subscriberHashId = amrhextotext.textToHex(subscriber.id)
      const unsubscribeLink = `https://${newsletter.username}.recur.email/unsubscribe/${subscriberHashId}`

      const fromEmail = `${newsletter.username}@recur.email`
      const from = newsletter.fromName ? `${newsletter.fromName} <${fromEmail}>` : fromEmail
      return {
        // TODO take it from another thing later
        "From": from,
        "ReplyTo": newsletter.user?.email,
        To: subscriber.email,
        Subject: subject,
        HtmlBody: htmlBody + `<br/><br/><a data-pm-no-track href="${unsubscribeLink}">Unsubscribe</a>`,
        TextBody: textBody + `\n\nUnsubscribe: ${unsubscribeLink}`,
        ApiToken: apiToken,
        EmailID: email.id,
        SubscriberID: subscriber.id,
        Headers: [
          {
            "Name": "List-Unsubscribe-Post",
            "Value": "List-Unsubscribe=One-Click"
          },
          {
            "Name": "List-Unsubscribe",
            "Value": '<'+unsubscribeLink+'>'
          },
        ],
      }
    }).filter((email) => email !== null)
    console.log('postmarkEmails', postmarkEmails.length)
    const emailsByNewsletterId = _.groupBy(postmarkEmails, (email: any) => email.newsletterId)
    
    for(const newsletterId in emailsByNewsletterId) {
      const emails = emailsByNewsletterId[newsletterId]
      const apiToken = (emails[0]||{}).ApiToken || ''
      const postmarkResp = await sendBatchMail(emails, apiToken)

      console.log('pending emails', emails)
      let i = 0
      for(const email of emails) {
        const postmarkMessageData = postmarkResp[i] || {}
        
        await db.outboundEmail.update({
          where: {
            id: email.EmailID
          },
          data: {
            status: OutboundEmailStatus.SENT,
            postmarkErrorCode: postmarkMessageData.ErrorCode,
            postmarkMessage: postmarkMessageData.Message,
            postmarkMessageId: postmarkMessageData.MessageID,
            postmarkTo: postmarkMessageData.To,
          }
        })
        i++;
      }
    }
    
    return new Response(JSON.stringify({}))
  } catch (error) {
    console.log('error sending mails', error)
    return new Response(null, { status: 500 })
  }
}
