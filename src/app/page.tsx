import { Navbar } from "@/components/navbar"
import { navigationConfig } from "@/config/navigation"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar items={navigationConfig} />
      
      <main className="flex flex-1 flex-col items-center justify-center p-12">
        <div className="mt-12 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Theme Switcher
          </h1>
          <p className="text-lg text-center max-w-2xl mb-8">
            This application demonstrates dark and light themes with a flexible navigation menu using shadcn and Next.js best practices.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <div className="p-6 rounded-lg border border-border bg-card text-card-foreground">
              <h2 className="text-xl font-semibold mb-2">Light/Dark Mode</h2>
              <p>The theme changes the UI colors for better readability in different lighting conditions.</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card text-card-foreground">
              <h2 className="text-xl font-semibold mb-2">Flexible Navigation</h2>
              <p>The navigation menu is built with TypeScript types and a centralized configuration file for easier maintenance.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
