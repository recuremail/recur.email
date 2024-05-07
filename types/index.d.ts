import { User } from "@prisma/client"
import type { Icon } from "lucide-react"

import { Icons } from "@/components/icons"

export type NavItem = {
  title: string
  href: string
  disabled?: boolean
}

export type MainNavItem = NavItem

export type SidebarNavItem = {
  title: string
  disabled?: boolean
  external?: boolean
  icon?: keyof typeof Icons
} & (
  | {
      href: string
      items?: never
    }
  | {
      href?: string
      items: NavLink[]
    }
)

export type SiteConfig = {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
  }
}


export type MarketingConfig = {
  mainNav: MainNavItem[]
}

export type DashboardConfig = {
  mainNav: MainNavItem[]
  sidebarNav: [
    {
      title: "General",
      href: "",
      icon: "home",
    },
    {
      title: "Emails",
      href: "/emails",
      icon: "email",
    },
    {
      title: "Subscribers",
      href: "subscribers",
      icon: "users",
    },
    {
      title: "Pending",
      href: "pending",
      icon: "pending",
    },
    {
      title: "Spam",
      href: "spam",
      icon: "spam",
    },
    {
      title: "Unsubscribed",
      href: "unsubscribed",
      icon: "unsubscribed",
    },
    {
      title: "Settings",
      href: "settings",
      icon: "settings",
    },
  ],
}

