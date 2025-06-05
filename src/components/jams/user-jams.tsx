"use client";

import { useState } from "react";
import { useUserCreatedJams, useUserAttendedJams } from "@/lib/hooks/useProfileJams";
import { JamGrid } from "./jam-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/providers/auth-provider";

interface UserJamsProps {
  userId: string;
  defaultTab?: "created" | "attended";
}

export function UserJams({ userId, defaultTab = "created" }: UserJamsProps) {
  const { user } = useAuth();
  const isOwnProfile = user?.id === userId;
  
  const [activeTab, setActiveTab] = useState<"created" | "attended">(defaultTab);
  // React Query hooks for created and attended jams, lazy-loaded by active tab
  const { data: createdJams = [], isLoading: loadingCreated, error: errorCreated } = useUserCreatedJams(userId, activeTab === "created");
  const { data: attendedJams = [], isLoading: loadingAttended, error: errorAttended } = useUserAttendedJams(userId, activeTab === "attended");
  const loading = activeTab === "created" ? loadingCreated : loadingAttended;
  const error = activeTab === "created" ? errorCreated : errorAttended;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Game Jams</h2>
        
        {isOwnProfile && (
          <Button asChild size="sm">
            <Link href="/jams/new">
              <Plus className="h-4 w-4 mr-1" />
              Create New Jam
            </Link>
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as "created" | "attended")}>
        <TabsList className="mb-4">
          <TabsTrigger value="created">
            Created
            {createdJams.length > 0 && (
              <span className="ml-2 text-xs font-medium bg-muted rounded-full px-2 py-0.5">
                {createdJams.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="attended">
            Participated In
            {attendedJams.length > 0 && (
              <span className="ml-2 text-xs font-medium bg-muted rounded-full px-2 py-0.5">
                {attendedJams.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="created">
          <JamGrid 
            jams={createdJams}
            loading={loading}
            emptyMessage={isOwnProfile ? "You haven't created any game jams yet" : "This user hasn't created any game jams yet"}
            variant="compact"
            columns={{ sm: 1, md: 1, lg: 2, xl: 2 }}
          />
        </TabsContent>
        
        <TabsContent value="attended">
          <JamGrid 
            jams={attendedJams}
            loading={loading}
            emptyMessage={isOwnProfile ? "You haven't participated in any game jams yet" : "This user hasn't participated in any game jams yet"}
            variant="compact"
            columns={{ sm: 1, md: 1, lg: 2, xl: 2 }}
          />
        </TabsContent>
      </Tabs>
      
      {error && (
        <div className="p-4 text-center text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-md">
          {error instanceof Error ? error.message : 'Failed to load jams'}
        </div>
      )}
    </div>
  );
} 