import { is } from "date-fns/locale"
import { getToken } from "next-auth/jwt"
import { withAuth } from "next-auth/middleware"
import { NextResponse, NextFetchEvent, NextRequest } from "next/server"
import { detectBot, parse } from "@/lib/middleware"

import { recordView } from "@/lib/tinybird"

export default withAuth(
  async function middleware(req: NextRequest, ev: NextFetchEvent) {
    const { pathname } = req.nextUrl

    if (
      pathname.endsWith(".php") ||
      pathname.endsWith(".html") ||
      pathname.endsWith(".env") ||
      pathname.endsWith(".env.prod") ||
      pathname.endsWith(".env.bak") ||
      pathname.endsWith(".env.dev") ||
      pathname.endsWith("/.svn/entries") ||
      pathname.endsWith("/.aws/credentials") ||
      pathname.endsWith("/phpinfo") ||
      pathname.endsWith("app-manifest.json") ||
      pathname.indexOf("wp-json") > -1 ||
      pathname.indexOf("DESKTOP_API_URL") > -1 ||
      pathname.indexOf("404") > -1 ||
      pathname.indexOf("_ignition/health-check") > -1 ||
      pathname.endsWith(".CityList") ||
      pathname.endsWith("ads.txt") ||
      pathname.endsWith("app-ads.txt") ||
      pathname.endsWith("/_profiler/phpinfo") ||
      pathname.endsWith("/admin/allowurl.txt")
    ) {
      return NextResponse.redirect("/404")
    }

    const hostname = req.headers.get("host") || ""
    console.log("hostname", hostname)

    if (hostname == "newsletter.new") {
      return NextResponse.redirect(
        new URL("https://recuremail.com/new?from=newsletter.new")
      )
    }
    if (hostname == "recur.email") {
      return NextResponse.redirect(new URL("https://recuremail.com"))
    }
    const token = await getToken({ req })
    const url = req.nextUrl.clone()

    const isAuth = !!token

    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register")

    // console.log("isAuth", url.href, isAuth, isAuthPage)
    if (isAuthPage) {
      if (isAuth) {
        console.log("redirecting to dashboard??", url.searchParams)
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }

      return null
    }

    const { domain, fullKey: key, path } = parse(req)
    const isBot = detectBot(req)

    let from = req.nextUrl.pathname

    if (req.nextUrl.search) {
      from += req.nextUrl.search
    }
    // if custom domain we need to redirect here?
    // we can use edge config to do this later.

    const referer = req.headers.get("referer")
    // console.log('domain, key', domain, key, from, isAuth, referer, req.nextUrl)

    // if (!isBot && key && !req.headers.get("kiwi-no-track") && (!referer || referer?.indexOf('https://recur.email/dashboard') == -1)) {
    //   // we only track track recur.email/anton/note-id
    //   const pathElements = path.split('/').filter((t) => t && t.length > 0)
    //   if(key.indexOf('.') == -1 && key.indexOf('dashboard') != 0 && pathElements.length == 2) {
    //     const slug = key
    //     if(slug) {
    //       ev.waitUntil(recordView(domain, req, path, slug)); // track the click only if there is no `kiwi-no-track` header
    //     }
    //   }
    // }
    console.log("can we get here?", key, isAuth, req.url, req.nextUrl)
    if (!isAuth && key == "dashboard") {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    const subdomain =
      process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
        ? hostname
            .replace(`.recur.email`, "")
            .replace(`.recur-email.vercel.app`, "")
        : hostname.replace(`.localhost:3000`, "")

    // if custom domain we need to redirect here?
    if (hostname.indexOf(".recur.email") > -1) {
      // redirected to the newsletter
      console.log("rewrite to", `/newsletters/${subdomain}${path}`)
      return NextResponse.rewrite(
        new URL(`/newsletters/${subdomain}${path}`, req.url)
      )
    }
    // if (!isAuth) {
    //   console.log('from what is this', from, domain, key)
    //   return NextResponse.redirect(
    //     new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
    //   );
    // }
    return NextResponse.next()
  },
  {
    callbacks: {
      async authorized() {
        // This is a work-around for handling redirect on auth pages.
        // We return true here so that the middleware function above
        // is always called.
        console.log("authorized callback.")
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    // "/dashboard/:path*","/login", "/register", "/:path*",
    /*
     * Match all paths except for:
     * 1. /api/ routes
     * 2. /_next/ (Next.js internals)
     * 3. /_proxy/, /_auth/ (special pages for OG tags proxying and password protection)
     * 4. /_static (inside /public)
     * 5. /_vercel (Vercel internals)
     * 6. /favicon.ico, /sitemap.xml, /site.webmanifest (static files)
     */
    "/((?!api/|_next/|_proxy/|_auth/|_static|_vercel|favicon.ico|favicon.png|favicon.svg|og.png|sitemap.xml|site.webmanifest).*)",
  ],
}
