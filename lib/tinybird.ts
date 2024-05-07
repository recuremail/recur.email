import { NextRequest, userAgent } from "next/server";
import { capitalize, getDomainWithoutWWW, LOCALHOST_GEO_DATA } from "./utils";
import { conn } from "./planetscale";

/**
 * Recording views with geo, ua, referer and timestamp data
 * If key is not specified, record click as the root click ("_root", e.g. dub.sh, vercel.fyi)
 **/
export async function recordView(
  domain: string,
  req: NextRequest,
  path: string,
  slug: string,
) {
  const geo = process.env.VERCEL === "1" ? req.geo : LOCALHOST_GEO_DATA;
  const ua = userAgent(req);
  const referer = req.headers.get("referer");
  if (!conn) return null;
  // return await conn.execute(
  //   "INSERT INTO slug_views(slug, slot, count, created_at) VALUES (?, RAND() * 100, 1, NOW()) ON DUPLICATE KEY UPDATE count = count + 1",
  //   [key]
  // )
  const trackingData = {
    timestamp: new Date(Date.now()).toISOString(),
    domain,
    path: path || "/",
    key: slug || "_root",
    country: geo?.country || "Unknown",
    city: geo?.city || "Unknown",
    region: geo?.region || "Unknown",
    latitude: geo?.latitude || "Unknown",
    longitude: geo?.longitude || "Unknown",
    ua: ua.ua || "Unknown",
    browser: ua.browser.name || "Unknown",
    browser_version: ua.browser.version || "Unknown",
    engine: ua.engine.name || "Unknown",
    engine_version: ua.engine.version || "Unknown",
    os: ua.os.name || "Unknown",
    os_version: ua.os.version || "Unknown",
    device: ua.device.type ? capitalize(ua.device.type) : "Desktop",
    device_vendor: ua.device.vendor || "Unknown",
    device_model: ua.device.model || "Unknown",
    cpu_architecture: ua.cpu?.architecture || "Unknown",
    bot: ua.isBot,
    referer: referer ? getDomainWithoutWWW(referer) : "(direct)",
    referer_url: referer || "(direct)",
  }
  return await Promise.allSettled([
    fetch(
      "https://api.us-east.tinybird.co/v0/events?name=view_events&wait=true",
      {
        method: "POST",
        body: JSON.stringify(trackingData),
        headers: {
          Authorization: `Bearer ${process.env.TINYBIRD_API_KEY}`,
        },
      },
    ).then((res) => res.json()),
    ...(slug && conn
      ? [
        conn.execute(
          "INSERT INTO slug_views(slug, slot, count, created_at, user_id, note_id) VALUES (?, RAND() * 100, 1, NOW(), (SELECT user_id from notes where slug = ?), (SELECT id from notes where slug = ?)) ON DUPLICATE KEY UPDATE count = count + 1",
          [slug, slug, slug]
        ).catch((e) => console.log('failed to insert slug view', path, slug, e)),
        ]
      : []),
  ]);
}

// export async function getViewsUsage({
//   domain,
//   start,
//   end,
// }: {
//   domain: string;
//   start?: string;
//   end?: string;
// }) {
//   const response = await fetch(
//     `https://api.us-east.tinybird.co/v0/pipes/usage.json?domain=${domain}${
//       start ? `&start=${start}` : ""
//     }${end ? `&end=${end}` : ""}`,
//     {
//       headers: {
//         Authorization: `Bearer ${process.env.TINYBIRD_API_KEY}`,
//       },
//     },
//   )
//     .then((res) => res.json())
//     .then((res) => res.data);

//   let clicks = 0;
//   try {
//     clicks = response[0]["count()"];
//   } catch (e) {
//     console.log(e);
//   }
//   return clicks;
// }
