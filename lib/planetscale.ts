import { connect } from "@planetscale/database";
import { OutboundEmailStatus, SubscriberStatus } from "@prisma/client";
import { db } from "./db";

export const pscale_config = {
  url: process.env.DATABASE_URL || "mysql://user:pass@host",
};

export const conn = process.env.DATABASE_URL ? connect(pscale_config) : null;

// this one is for OG
export const getNoteViaEdge = async (slug: string) => {
  if (!conn) return null;

  const { rows } =
    (await conn.execute(
      "SELECT slug, views, userId, publicStats FROM notes WHERE `slug` = ?",
      [slug],
    )) || {};

  return rows && Array.isArray(rows) && rows.length > 0
    ? (rows[0] as {
        slug: string;
        views: number;
        userId: number;
        publicStats: boolean;
      })
    : null;
};

function queryPotentialSpammers(newsletterId){
  return {
      newsletterId,
      honeypotIsFound: true,
      status: {
        not: {
          in: [SubscriberStatus.SPAMMER_DELETED, SubscriberStatus.DELETED]
        }
      },
      OR: [
        {
          status: {
            not: SubscriberStatus.VERIFIED
          }
        }, {
          status: SubscriberStatus.VERIFIED,
          verifiedByUserId: null
        }
      ]
  }
}

export const findPotentialSpammers = async (newsletterId: string) => {
  let subscribers = await db.subscriber.findMany({
    where: queryPotentialSpammers(newsletterId),
    select: {
      id: true,
      email: true,
      status: true,
      createdAt: true,
      clientIPCity: true,
      clientIPCountry: true,
      honeypotThreatScore: true,
      verifiedByUserId: true,
      _count: {
        select: {
          outboundEmails: {
            where: {
              status: OutboundEmailStatus.SENT
            }
          }
        }
      }
    },
    orderBy: {
      honeypotThreatScore: 'desc'
    }
  })
  return subscribers
}

export const countPotentialSpammers = async (newsletterId: string) => {
  let potentialSpammers = await db.subscriber.count({
    where: queryPotentialSpammers(newsletterId),
  })
  return potentialSpammers
}