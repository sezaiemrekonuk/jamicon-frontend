"use client";

import { JamForm } from "@/components/jams/jam-form";
import { Button } from "@/components/ui/button";
import { jamApi } from "@/lib/api/jam";
import { Jam } from "@/types/jam";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { toast } from "@/components/ui/use-toast";

interface EditJamPageProps {
  params: {
    slug: string;
  };
}

export default function EditJamPage({ params }: EditJamPageProps) {
  const { slug } = params;
  const router = useRouter();
  const { user, status } = useAuth();
  
  const [jam, setJam] = useState<Jam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load jam data
  useEffect(() => {
    const loadJam = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const jamData = await jamApi.getJamBySlug(slug);
        setJam(jamData);
        
        // Check if user has permission to edit this jam
        if (user && jamData.createdByUserId !== user.id) {
          // If the user is not the creator, redirect
          router.push(`/jams/${slug}`);
          toast({
            title: "Access Denied",
            description: "You don't have permission to edit this jam.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading jam:", error);
        setError("Failed to load jam details. It may have been deleted or you may not have permission to view it.");
      } finally {
        setLoading(false);
      }
    };
    
    if (status === "authenticated") {
      loadJam();
    } else if (status === "unauthenticated") {
      router.push("/login?returnUrl=/jams/" + slug + "/edit");
    }
  }, [slug, user, status, router]);
  
  // Handle successful edit
  const handleSuccess = (updatedJam: Jam) => {
    toast({
      title: "Jam Updated",
      description: "Your changes have been saved successfully.",
    });
    router.push(`/jams/${updatedJam.slug}`);
  };
  
  // Show loading state
  if (loading || status === "loading") {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-12"></div>
          
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <Link 
          href={`/jams/${slug}`} 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Jam
        </Link>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h1 className="text-xl font-medium text-red-800 dark:text-red-300 mb-2">
            Error
          </h1>
          <p className="text-red-700 dark:text-red-400 mb-4">
            {error}
          </p>
          <Button asChild>
            <Link href="/jams">Go to Jams</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Jam not found
  if (!jam) {
    return notFound();
  }
  
  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Link 
        href={`/jams/${slug}`} 
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Jam
      </Link>
      
      <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Jam</h1>
      <p className="text-muted-foreground mb-8">
        Update your jam settings
      </p>
      
      <JamForm jam={jam} onSuccess={handleSuccess} />
    </div>
  );
} 