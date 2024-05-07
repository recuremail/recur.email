import { db } from "@/lib/db"

import { SubscriberStatus } from "@prisma/client"
import _ from "lodash"

export const revalidate = 0

// 5 minutes
export const maxDuration = 300

export async function GET() {
  try {
    console.log('notify owner on subscriber')
    // DO limit 500
    const pendingNewSubscribers = await db.subscriber.findMany({
      where: {
        status: SubscriberStatus.VERIFIED,
        ownerNotifiedAt: null,
        //no need to notify for imported subscribers
        importedAt: null,
      },
      include: {
        newsletter: {
          include: {
            user: true
          }
        }
      }
    })
    for(const pendingNewSubscriber of pendingNewSubscribers) {
      const { newsletter } = pendingNewSubscriber
      const { user } = newsletter
      if(user && newsletter) {
        const tokens = (newsletter.postmarkServer || {})['ApiTokens'] || []
        const apiToken = tokens[0] || ""
        // TODO readd this later after I implement anti spam thingies
        // await sendMail(user.email, 
        //   `New subscriber to ${newsletter.username} newsletter 🎉`, 
        //   `New subscriber to ${newsletter.username} newsletter: ${pendingNewSubscriber.email}`, 
        //   `New subscriber to ${newsletter.username} newsletter: ${pendingNewSubscriber.email}`, 
        //   'outbound', 
        //   'new-subscriber',
        //   apiToken)
        await db.subscriber.update({
          where:{
            id: pendingNewSubscriber.id,
            ownerNotifiedAt: null
          },
          data: {
            ownerNotifiedAt: new Date()
          }
        })
      }
    }
    return new Response(JSON.stringify({}))
  } catch (error) {
    console.log('error sending mails', error)
    return new Response(null, { status: 500 })
  }
}
