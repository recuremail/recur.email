"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { SidebarNavItem } from "types"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface DashboardNavProps {
  items: SidebarNavItem[]
  basePath: string
  currentPath: string
}

export function DashboardNav({ items, basePath, currentPath }: DashboardNavProps) {


  if (!items?.length) {
    return null
  }

  return (
    <nav className="">
      {items.map((item, index) => {
        const Icon = Icons[item.icon || "arrowRight"]
        return (
          item && (
            <Link key={index} href={basePath + "/" + item.href}>
              <span
                className={cn(
                  "group items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground inline-block mr-1",
                (item.href && currentPath.endsWith(item.href)) || (currentPath == basePath && item.href=="")  ? "bg-accent" : "transparent",
                  item.disabled && "cursor-not-allowed opacity-80"
                )}
              >
                <Icon className="mr-2 h-4 w-4 inline-block" />
                <span>{item.title}</span>
              </span>
            </Link>
          )
        )
      })}
    </nav>
  )
}
