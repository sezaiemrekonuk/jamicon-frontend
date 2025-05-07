"use client";

import { JamForm } from "@/components/jams/jam-form";
import { useAuth } from "@/lib/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateJamPage() {
  const { status } = useAuth();
  const router = useRouter();
  
  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?returnUrl=/jams/create");
    }
  }, [status, router]);
  
  if (status === "loading") {
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
  
  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Create a New Jam</h1>
      <p className="text-muted-foreground mb-8">
        Set up your game jam and invite participants
      </p>
      
      <JamForm />
    </div>
  );
} 