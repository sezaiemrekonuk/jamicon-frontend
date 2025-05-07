"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"

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
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@/lib/providers/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BRAND } from "@/lib/constants"
import { NotificationDropdown, MobileNotifications } from "@/components/ui/notification-dropdown"

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
  const { user, status, logout } = useAuth();
  const isAuthenticated = status === "authenticated";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="w-full border-b">
    <div className="container mx-auto">
      <div className={cn("flex items-center justify-between mx-auto max-w-7xl py-3", className)}>
        {/* Logo - Left */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <Image src={BRAND.logo.src} alt={BRAND.logo.alt} width={BRAND.logo.width} height={BRAND.logo.height} />
          </Link>
        </div>

        {/* Desktop Navigation & Auth - Right */}
        <div className="hidden md:flex items-center space-x-6">
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
                    <NavDropdownMenuItem key={index} item={item} />
                  )
                }

                return null
              })}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center space-x-4">
            {isAuthenticated && <NotificationDropdown />}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center gap-2 rounded-full pl-2 pr-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl || undefined} alt={user?.username || "User"} />
                      <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{user?.username || "User"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/teams">Teams</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/jams">Game Jams</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="secondary" size="sm">
                  <Link href="/login" className="text-sm font-medium">
                    Login
                  </Link>
                </Button>
                <Button variant="default" size="sm">
                  <Link href="/register" className="text-sm font-medium">
                    Register
                  </Link>
                </Button>
              </>
            )}
            {includeThemeToggle && (
              <ThemeToggle />
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          {includeThemeToggle && (
            <ThemeToggle />
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-3 mt-4">
                {items?.map((item, index) => {
                  if (item.type === "link") {
                    return (
                      <Link
                        key={index}
                        href={item.href}
                        className="text-sm font-medium hover:underline"
                      >
                        {item.title}
                      </Link>
                    )
                  }

                  if (item.type === "dropdown") {
                    return (
                      <div key={index} className="space-y-2">
                        <div className="font-medium">{item.title}</div>
                        <div className="ml-4 space-y-2">
                          {item.items.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              href={subItem.href}
                              className="block text-sm text-muted-foreground hover:text-foreground"
                            >
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  return null
                })}
                
                {isAuthenticated && <MobileNotifications />}
                
                <div className="pt-4 border-t">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center space-x-2 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatarUrl || undefined} alt={user?.username || "User"} />
                          <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium">{user?.username || "User"}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <Link href="/dashboard" className="block text-sm font-medium hover:underline mb-2">
                        Dashboard
                      </Link>
                      <Link href="/profile" className="block text-sm font-medium hover:underline mb-2">
                        Profile
                      </Link>
                      <Link href="/teams" className="block text-sm font-medium hover:underline mb-2">
                        Teams
                      </Link>
                      <Link href="/jams" className="block text-sm font-medium hover:underline mb-2">
                        Game Jams
                      </Link>
                      <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="block text-sm font-medium hover:underline mb-2">
                        Login
                      </Link>
                      <Link href="/register" className="block text-sm font-medium hover:underline">
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
    </div>
  )
}

interface NavDropdownMenuItemProps {
  item: DropdownItem
}

function NavDropdownMenuItem({ item }: NavDropdownMenuItemProps) {
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