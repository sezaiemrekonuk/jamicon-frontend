// This is the public page

import { JamGrid } from "@/components/jams/jam-grid";
import { jamApi } from "@/lib/api/jam";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, TrendingUp } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate at most every minute

export default async function Home() {
  // Fetch featured and trending jams for the homepage
  const [featuredJams, trendingJams] = await Promise.all([
    jamApi.getFeaturedJams({ active: true, limit: 4 }),
    jamApi.getTrendingJams({ active: true, limit: 4 })
  ]);

  return (
    <main className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <section className="mb-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome to JamIcon
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover game jams, join teams, submit your games, and connect with other creators.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Link href="/jams" className="block">
            <Button variant="outline" className="w-full py-8 h-auto flex flex-col items-center justify-center gap-3">
              <CalendarDays className="h-10 w-10" />
              <div className="text-center">
                <h3 className="text-lg font-medium">Browse Jams</h3>
                <p className="text-sm text-muted-foreground">
                  Find active and upcoming game jams
                </p>
              </div>
            </Button>
          </Link>
          
          <Link href="/jams/create" className="block">
            <Button className="w-full py-8 h-auto flex flex-col items-center justify-center gap-3">
              <CalendarDays className="h-10 w-10" />
              <div className="text-center">
                <h3 className="text-lg font-medium">Create a Jam</h3>
                <p className="text-sm text-muted-foreground">
                  Start your own game jam event
                </p>
              </div>
            </Button>
          </Link>
        </div>
      </section>
      
      {featuredJams.length > 0 && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Featured Jams
            </h2>
            <Link href="/jams?featured=true">
              <Button variant="link">View all</Button>
            </Link>
          </div>
          
          <JamGrid jams={featuredJams} columns={{ sm: 1, md: 2, lg: 2, xl: 4 }} />
        </section>
      )}
      
      {trendingJams.length > 0 && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Trending Jams
              </h2>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <Link href="/jams?trending=true">
              <Button variant="link">View all</Button>
            </Link>
          </div>
          
          <JamGrid jams={trendingJams} columns={{ sm: 1, md: 2, lg: 2, xl: 4 }} />
        </section>
      )}
      
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Active Jams
          </h2>
          <Link href="/jams?active=true">
            <Button variant="link">View all</Button>
          </Link>
        </div>
        
        {/* This is async, loading state will be handled by the component */}
        <ActiveJamsSection />
      </section>
    </main>
  );
}

async function ActiveJamsSection() {
  const activeJams = await jamApi.getActiveJams({ limit: 8 });
  
  return (
    <JamGrid 
      jams={activeJams} 
      columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} 
      emptyMessage="No active jams at the moment. Check back soon!" 
    />
  );
}