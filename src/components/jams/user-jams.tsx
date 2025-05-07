"use client";

import { useState, useEffect } from "react";
import { jamApi } from "@/lib/api/jam";
import { Jam } from "@/types/jam";
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
  
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [createdJams, setCreatedJams] = useState<Jam[]>([]);
  const [attendedJams, setAttendedJams] = useState<Jam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadJams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load created jams if that tab is active or it's the initial load
        if (activeTab === "created" || !createdJams.length) {
          const created = await jamApi.getUserCreatedJams(userId);
          setCreatedJams(created);
        }
        
        // Load attended jams if that tab is active or it's the initial load
        if (activeTab === "attended" || !attendedJams.length) {
          const attended = await jamApi.getUserAttendedJams(userId);
          setAttendedJams(attended);
        }
      } catch (error) {
        console.error("Error loading jams:", error);
        setError("Failed to load jams. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    loadJams();
  }, [userId, activeTab]);
  
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            loading={loading && activeTab === "created"}
            emptyMessage={isOwnProfile ? "You haven't created any game jams yet" : "This user hasn't created any game jams yet"}
            variant="compact"
            columns={{ sm: 1, md: 1, lg: 2, xl: 2 }}
          />
        </TabsContent>
        
        <TabsContent value="attended">
          <JamGrid 
            jams={attendedJams}
            loading={loading && activeTab === "attended"}
            emptyMessage={isOwnProfile ? "You haven't participated in any game jams yet" : "This user hasn't participated in any game jams yet"}
            variant="compact"
            columns={{ sm: 1, md: 1, lg: 2, xl: 2 }}
          />
        </TabsContent>
      </Tabs>
      
      {error && (
        <div className="p-4 text-center text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
} 