export type NavItemBase = {
  title: string
  href: string
}

export type SimpleNavItem = NavItemBase & {
  type: "link"
}

export type NavItemWithDescription = NavItemBase & {
  description: string
}

export type NavLinkItem = NavItemWithDescription & {
  type: "link-with-description"
}

export type FeaturedItem = NavItemWithDescription & {
  type: "featured"
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export type DropdownItem = {
  type: "dropdown"
  title: string
  items: (NavLinkItem | FeaturedItem)[]
}

export type NavItem = SimpleNavItem | DropdownItem 