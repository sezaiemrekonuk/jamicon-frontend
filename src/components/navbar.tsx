"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { NavItem, DropdownItem, NavLinkItem, FeaturedItem } from "@/types/navigation"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface NavbarProps {
  items?: NavItem[]
  className?: string
  includeThemeToggle?: boolean
}

export function Navbar({ 
  items, 
  className,
  includeThemeToggle = true
}: NavbarProps) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-3", className)}>
      <Link href="/" className="flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="font-bold text-xl">Your App</span>
      </Link>
      
      <div className="flex items-center space-x-4">
        <NavigationMenu>
          <NavigationMenuList>
            {items?.map((item, index) => {
              if (item.type === "link") {
                return (
                  <NavigationMenuItem key={index}>
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        {item.title}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )
              }

              if (item.type === "dropdown") {
                return (
                  <DropdownMenuItem key={index} item={item} />
                )
              }

              return null
            })}
          </NavigationMenuList>
        </NavigationMenu>

        {includeThemeToggle && (
          <ThemeToggle />
        )}
      </div>
    </div>
  )
}

interface DropdownMenuItemProps {
  item: DropdownItem
}

function DropdownMenuItem({ item }: DropdownMenuItemProps) {
  const featuredItem = item.items.find((i) => i.type === "featured") as FeaturedItem | undefined
  const otherItems = item.items.filter((i) => i.type !== "featured") as NavLinkItem[]
  
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
      <NavigationMenuContent>
        {featuredItem ? (
          <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
            <li className="row-span-3">
              <NavigationMenuLink asChild>
                <a
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                  href={featuredItem.href}
                >
                  <Icons.logo className="h-6 w-6" />
                  <div className="mb-2 mt-4 text-lg font-medium">
                    {featuredItem.title}
                  </div>
                  <p className="text-sm leading-tight text-muted-foreground">
                    {featuredItem.description}
                  </p>
                </a>
              </NavigationMenuLink>
            </li>
            {otherItems.map((item, index) => (
              <ListItem key={index} title={item.title} href={item.href}>
                {item.description}
              </ListItem>
            ))}
          </ul>
        ) : (
          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
            {otherItems.map((item, index) => (
              <ListItem key={index} title={item.title} href={item.href}>
                {item.description}
              </ListItem>
            ))}
          </ul>
        )}
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem" 