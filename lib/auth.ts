import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"

import EmailProvider from "next-auth/providers/email";
import { db } from "@/lib/db"
// import { createTransport } from "nodemailer"
import { sendMail } from "@/lib/emails"

const server = {
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD
  }
}
export const authOptions: NextAuthOptions = {
  // huh any! I know.
  // This is a temporary fix for prisma client.
  // @see https://github.com/prisma/prisma/issues/16117
  adapter: PrismaAdapter(db as any),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    EmailProvider({
      server: server,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    })
  ],
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
  events: {
    createUser: async (message) => {
      console.error('CUSTOM EVENT createUser', message);
      await sendMail('podviaznikov@gmail.com', 
        `New user for recur.email 🎉`, 
        `New user ${JSON.stringify(message)}`,
        `New user ${JSON.stringify(message)}`,
        'outbound', 
        'new-user')
    },
  },
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
      }

      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        },
      })

      if (!dbUser) {
        if (user) {
          token.id = user?.id
        }
        return token
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      }
    },
  },
}




async function sendVerificationRequest(params) {
  console.log('sendVerificationRequest', params)
  const { identifier, url, provider } = params
  const { host } = new URL(url)
  console.log('sendVerificationRequest2')
  // NOTE: You are not required to use `nodemailer`, use whatever you want.
  // const transport = createTransport(provider.server)
  try {
    console.log('sendVerificationRequest3')
    console.log('sendVerificationRequest3.5', identifier, host)
    const textContent = text({ url, host })
    console.log('sendVerificationRequest3.6', textContent )
    const htmlContent = html({ url, host })
    console.log('sendVerificationRequest3.8. skip')
    const result = await sendMail(identifier, `Sign in to ${host}`, htmlContent, textContent, 'outbound', 'signin')
    console.log('result for email', result)
    console.log('sendVerificationRequest3')
  } catch (error) {
    console.log('failed to send email', error)
    throw new Error(`Email could not be sent`)
  }
}

/**
 * Email HTML body
 * Insert invisible space into domains from being turned into a hyperlink by email
 * clients like Outlook and Apple mail, as this is confusing because it seems
 * like they are supposed to click on it to sign in.
 *
 * @note We don't add the email address to avoid needing to escape it, if you do, remember to sanitize it!
 */
function html(params: { url: string; host: string; }) {
  const { url, host } = params

  const escapedHost = host.replace(/\./g, "&#8203;.")

  const brandColor = "65A30D"
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: "#fff",
  }

  return `
  <a data-pm-no-track href="${url}" target="_blank">Sign in</a> to <strong>${escapedHost}</strong>
  <br></br>
  <small>If you did not request this email you can safely ignore it.</small>
  `
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`
}