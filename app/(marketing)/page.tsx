import Link from "next/link"

import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { IndexRedirect } from "@/components/index-redirect"



export default async function IndexPage() {
  const user = await getCurrentUser()
  
  return (
    <>
      {user ? <IndexRedirect user={user} /> : <></>}
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-16">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.15] text-black sm:text-6xl sm:leading-[1.15] dark:text-white">
            create your own
            <br />
            <span className="text-lime-600">
            newsletter
            </span>
          </h1>
          <h2 className="mt-5 text-gray-600 sm:text-xl dark:text-gray-100">
            Recur Email is the easiest way to create and send a newsletter.
          </h2>

          <div className="space-x-4">
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
              Get Started
            </Link>
          </div>

          <div className="mt-5 dark:prose-dark text-left w-full px-5 md:px-10">
            <h3 className="font-bold mb-2">The steps are simple:</h3>
            <ol className="list-decimal list-inside">
              <li className="mb-1">Signup here.</li>
              <li className="mb-1">Create newsletter.</li>
              <li className="mb-1">Start sending emails directly from your Mail client.</li>
              <li className="mb-1">... that is it. No need to learn new tools.</li>
            </ol>
          </div>
          <div className="mt-5 dark:prose-dark text-left w-full px-5 md:px-10">
            <h3 className="font-bold mb-2">How is it different:</h3>
            It&apos;s the simplest possible tool. The focus is on sending <i>authentic</i> emails.
            <br/>No marketing fluff. No fancy templates. No complex interfaces.
            <br/>
            Open your Mail client, write your email, send it to your newsletter address.
            That is it. No need to learn new tools.
          </div>
          <div className="mt-5 dark:prose-dark text-left w-full px-5 md:px-10">
            <video title="recur.email demo" className="w-full" controls src="https://res.cloudinary.com/montaigne-io/video/upload/v1695251411/35235FA1-648B-4306-9F50-CD4FACB11C90.mp4"></video>
            </div>
          <div className="mt-5 dark:prose-dark text-left w-full px-5 md:px-10">
            <h3 className="font-bold mb-2">Subscribe for updates</h3>
            <form className="" action="https://newsletter.recur.email/subscribe" method="post">
              <div className="mb-3 flex space-x-2">
                <input className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="email" placeholder="hello@recur.email" name="email"/>
                <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 shrink-0"><span>Subscribe</span></button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
