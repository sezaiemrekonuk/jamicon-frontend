import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to Acme Inc
            </h1>
            <p className="text-lg text-center max-w-2xl mb-8">
              A modern application with authentication built using shadcn and Next.js best practices.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              <div className="p-6 rounded-lg border border-border bg-card text-card-foreground">
                <h2 className="text-xl font-semibold mb-2">Authentication</h2>
                <p>Secure login and registration with form validations and social authentication options.</p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card text-card-foreground">
                <h2 className="text-xl font-semibold mb-2">Responsive Design</h2>
                <p>Beautiful UI that works perfectly on desktop and mobile devices.</p>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/register">
                <Button size="lg" className="px-8">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 