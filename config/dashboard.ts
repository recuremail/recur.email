import { DashboardConfig } from "types"

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Docs",
      href: "https://docs.recur.email",
    },
    {
      title: "Pricing",
      href: "https://docs.recur.email/pricing",
    }
  ],
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
