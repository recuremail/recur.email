import { Subscriber } from "@prisma/client"
import { db } from "./db"
import { queryHoneypotIP } from "./honeypot"


export async function checkAndSaveIPAddressMeta(subscriberId: string, clientIP: string): Promise<Subscriber | null> {
  if(clientIP) {
    const honeypot = await queryHoneypotIP(clientIP)
    console.log('honeypot', honeypot)
    // @ts-ignore
    if(honeypot && !honeypot.found) {
     return  await db.subscriber.update({
        where: {
          id: subscriberId
        },
        data: {
          honeypotIsFound: false,
          // @ts-ignore
          honeypotData: honeypot,
          honeypotLastCheckedAt: new Date()
        }
      })
    } else if (honeypot){
      return await db.subscriber.update({
        where: {
          id: subscriberId
        },
        data: {
          honeypotIsFound: true,
          // @ts-ignore
          honeypotData: honeypot,
          honeypotLastCheckedAt: new Date(),
          // @ts-ignore
          honeypotLastSeenDays: honeypot.lastSeenDays,
          // @ts-ignore
          honeypotThreatScore: honeypot.threatScore,
          // @ts-ignore
          honeypotIsHarvester: honeypot.type.harvester == true,
          // @ts-ignore
          honeypotIsSearchEngine: honeypot.type.searchEngine == true,
          // @ts-ignore
          honeypotIsSpammer: honeypot.type.spammer == true,
          // @ts-ignore
          honeypotIsSuspicious: honeypot.type.suspicious == true,
        }
      })
    }
  }
  return null
}