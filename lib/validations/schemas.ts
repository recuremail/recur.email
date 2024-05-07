import * as z from "zod"
import { optional } from "zod"

export const userNameSchema = z.object({
  name: z.string().min(3).max(32),
  // email: z.string().email().optional(),
  // publicEmail: z.string().email().optional(),
})

export const userUsernmameSchema = z.object({
  username: z.string()
  .regex(new RegExp(/^[a-zA-Z0-9_]+$/), 'Username can only contain letters, numbers and underscore')
  .min(3).max(32),
})


export const userSetupSchema = z.object({
  username: z.string()
  .regex(new RegExp(/^[a-zA-Z0-9_]+$/), 'Username can only contain letters, numbers and underscore')
  .min(3).max(32),
  publicEmail: z.string().email(),
})

export const newsletterSetupSchema = z.object({
  username: z.string()
  .regex(new RegExp(/^[a-zA-Z0-9\-]+$/), 'Username can only contain letters, numbers and dash.')
  .min(3).max(32),
  name: z.string(),
  description: z.string().optional(),
})

export const newsletterUpdateSchema = z.object({
  name: z.string().min(1).max(190).optional(),
  description: z.string().min(1).max(190).optional(),
  fromName: z.string().max(190).optional().default(""),
  website: z.string().url().max(190).optional().default(""),
  twitter: z.string().max(190).optional().default(""),
  emoji: z.string().max(5).optional().default(""),
  keywords: z.string().max(190).optional().default(""),
  trackLinks: z.boolean().default(false).optional(),
  trackOpens: z.boolean().default(false).optional(),
  webArchive: z.boolean().default(false).optional(),
  webArchiveOnHomePage: z.boolean().default(false).optional(),
  editorsEmails: z.string().optional(),
})


export const subscribersImportSchema = z.object({
  subscribersText: z.string().optional(),
})



export const userUrlsSchema = z.object({
  url: z.string().url().optional(),
  twitter: z.string().optional(),
})


export const userUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  username: z.string()
    .regex(new RegExp(/^[a-zA-Z0-9_]+$/), 'Username can only contain letters, numbers and underscore')
    .min(3).optional(),
  publicEmail: z.string().email().optional(),
  url: z.string().url().optional(),
  twitter: z.string().optional(),
})


export const newSubscriberSchema = z.object({
  // more specific validation for
  email: z.string().email(),
})
