import { NavItem } from "@/types/navigation"

export const navigationConfig: NavItem[] = [
  {
    type: "link",
    title: "Home",
    href: "/"
  },
  {
    type: "link",
    title: "Game Jams",
    href: "/jams"
  },
  {
    type: "dropdown",
    title: "Community",
    items: [
      {
        type: "link-with-description",
        title: "Teams",
        href: "/teams",
        description: "Find or create teams for game development."
      },
      {
        type: "link-with-description",
        title: "Games",
        href: "/games",
        description: "Discover games created by the community."
      },
      {
        type: "link-with-description",
        title: "Members",
        href: "/users",
        description: "Connect with other game developers."
      }
    ]
  },
  {
    type: "dropdown",
    title: "Getting Started",
    items: [
      {
        type: "featured",
        title: "shadcn/ui",
        href: "/",
        description: "Beautifully designed components built with Radix UI and Tailwind CSS."
      },
      {
        type: "link-with-description",
        title: "Introduction",
        href: "/docs",
        description: "Re-usable components built using Radix UI and Tailwind CSS."
      },
      {
        type: "link-with-description",
        title: "Installation",
        href: "/docs/installation",
        description: "How to install dependencies and structure your app."
      },
      {
        type: "link-with-description",
        title: "Typography",
        href: "/docs/primitives/typography",
        description: "Styles for headings, paragraphs, lists...etc"
      }
    ]
  },
  {
    type: "dropdown",
    title: "Components",
    items: [
      {
        type: "link-with-description",
        title: "Alert Dialog",
        href: "/docs/primitives/alert-dialog",
        description: "A modal dialog that interrupts the user with important content and expects a response."
      },
      {
        type: "link-with-description",
        title: "Hover Card",
        href: "/docs/primitives/hover-card",
        description: "For sighted users to preview content available behind a link."
      },
      {
        type: "link-with-description",
        title: "Progress",
        href: "/docs/primitives/progress",
        description: "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar."
      },
      {
        type: "link-with-description",
        title: "Scroll-area",
        href: "/docs/primitives/scroll-area",
        description: "Visually or semantically separates content."
      },
      {
        type: "link-with-description",
        title: "Tabs",
        href: "/docs/primitives/tabs",
        description: "A set of layered sections of content—known as tab panels—that are displayed one at a time."
      },
      {
        type: "link-with-description",
        title: "Tooltip",
        href: "/docs/primitives/tooltip",
        description: "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it."
      }
    ]
  },
  {
    type: "link",
    title: "Documentation",
    href: "/docs"
  }
] 