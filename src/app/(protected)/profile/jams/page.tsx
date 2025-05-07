"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { UserJams } from "@/components/jams/user-jams";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function UserJamsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading jams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="flex items-center gap-1">
            <Link href="/profile">
              <ChevronLeft className="h-4 w-4" />
              Back to Profile
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">My Game Jams</h1>
        </div>
        
        <Button asChild>
          <Link href="/jams/new">
            <Plus className="h-4 w-4 mr-2" />
            Create New Jam
          </Link>
        </Button>
      </div>
      
      <UserJams userId={user.id} />
    </div>
  );
} 