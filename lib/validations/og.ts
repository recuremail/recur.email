import * as z from "zod"

export const ogImageSchema = z.object({
  title: z.string(),
  type: z.string().default("newsletter"),
  author: z.string().default("recur.email"),
  url: z.string().default("url"),
  mode: z.enum(["light", "dark"]).default("light"),
  domain: z.string().default("recur.email"),
  emoji: z.string().default("💌"),
})
