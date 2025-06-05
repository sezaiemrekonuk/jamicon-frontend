"use client";

import { JamGrid } from "@/components/jams/jam-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useJams, JamFilter } from "@/lib/hooks/useJams";
import { Jam, Visibility } from "@/types/jam";
import { useAuth } from "@/lib/providers/auth-provider";
import { CalendarDays, PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function JamsPage() {
  const { status } = useAuth();
  const isAuthenticated = status === "authenticated";
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<JamFilter>("all");
  // Fetch jams from API with React Query
  const { data: jams = [], isLoading: loading, error: queryError } = useJams(activeTab);
  // Optionally log API errors
  useEffect(() => {
    if (queryError) console.error("Error loading jams:", queryError);
  }, [queryError]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibility, setVisibility] = useState<Visibility | "">("");
  
  // Get filter params from URL
  const featured = searchParams.get("featured") === "true";
  const trending = searchParams.get("trending") === "true";
  const active = searchParams.get("active") === "true";
  
  useEffect(() => {
    // Set the active tab based on URL params
    if (featured) {
      setActiveTab("featured");
    } else if (trending) {
      setActiveTab("trending");
    } else if (active) {
      setActiveTab("active");
    } else {
      setActiveTab("all");
    }
  }, [searchParams]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as JamFilter);
    
    // Update URL based on selected tab
    switch (value) {
      case "featured":
        router.push("/jams?featured=true");
        break;
      case "trending":
        router.push("/jams?trending=true");
        break;
      case "active":
        router.push("/jams?active=true");
        break;
      default:
        router.push("/jams");
        break;
    }
  };
  
  // Handle visibility change
  const handleVisibilityChange = (value: string) => {
    setVisibility(value as Visibility | "");
  };
  
  // Filter jams based on search query and visibility
  const filteredJams = jams.filter((jam) => {
    let passesSearch = true;
    let passesVisibility = true;
    
    if (searchQuery) {
      passesSearch = 
        jam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (jam.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (jam.theme?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    }
    
    if (visibility) {
      passesVisibility = jam.visibility === visibility;
    }
    
    return passesSearch && passesVisibility;
  });
  
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Game Jams</h1>
          <p className="text-muted-foreground mt-1">
            Discover and participate in game development competitions
          </p>
        </div>
        
        {isAuthenticated && (
          <Button asChild>
            <Link href="/jams/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Jam
            </Link>
          </Button>
        )}
      </div>
      
      <div className="mb-8">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Jams</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jams..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={visibility} onValueChange={handleVisibilityChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visibilities</SelectItem>
            <SelectItem value={Visibility.PUBLIC}>Public</SelectItem>
            <SelectItem value={Visibility.UNLISTED}>Unlisted</SelectItem>
            <SelectItem value={Visibility.PRIVATE}>Private</SelectItem>
            <SelectItem value={Visibility.DRAFT}>Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {filteredJams.length > 0 || loading ? (
        <JamGrid 
          jams={filteredJams} 
          loading={loading} 
          columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
        />
      ) : (
        <div className="text-center py-16">
          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No jams found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? "Try adjusting your search or filters to find what you're looking for."
              : "There are no jams available at the moment."}
          </p>
          
          {isAuthenticated && (
            <Button asChild>
              <Link href="/jams/create">Create a Jam</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 