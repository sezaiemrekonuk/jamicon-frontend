"use client";

import { JamDetails } from "@/components/jams/jam-details";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { jamApi } from "@/lib/api/jam";
import { useJam } from "@/lib/hooks/useJam";
import { JamWithTeamsAndGames } from "@/types/jam";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useParams } from "next/navigation";

interface JamPageProps {
  params: {
    slug: string;
  };
}

export default function JamPage({ params }: JamPageProps) {
  // Use the useParams hook for client components in Next.js 15
  const routeParams = useParams<{ slug: string }>();
  const slug = routeParams.slug;
  const router = useRouter();
  
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Fetch jam details with React Query
  const { data: jam, isLoading: loading, error: queryError } = useJam(slug);
  // Only show an error message if the query actually errored
  let errorMessage: string | null = null;
  if (queryError) {
    if (queryError instanceof Error) {
      errorMessage = queryError.message;
    } else if (typeof queryError === 'string') {
      errorMessage = queryError;
    } else {
      errorMessage = 'Failed to load jam details.';
    }
  }
  
  // Handle jam deletion
  const handleDeleteJam = async () => {
    if (!jam) return;
    
    try {
      setDeleting(true);
      await jamApi.deleteJam(jam.id);
      
      toast({
        title: "Jam deleted",
        description: "The jam has been successfully deleted.",
      });
      
      setConfirmDelete(false);
      router.push("/jams");
    } catch (error) {
      console.error("Error deleting jam:", error);
      
      toast({
        title: "Error",
        description: "Failed to delete the jam. Please try again.",
        variant: "destructive",
      });
      
      setDeleting(false);
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Show error message if jam failed to load
  if (errorMessage) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Link 
          href="/jams" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Jams
        </Link>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h1 className="text-xl font-medium text-red-800 dark:text-red-300 mb-2">
            Jam Not Found
          </h1>
          <p className="text-red-700 dark:text-red-400 mb-4">
            {errorMessage}
          </p>
          <Button asChild>
            <Link href="/jams">Go to Jams</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Jam not found (no error but also no data)
  if (!jam) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Link 
          href="/jams" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Jams
        </Link>
        
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-2">Jam Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find the jam you're looking for.
          </p>
          <Button asChild>
            <Link href="/jams">Browse All Jams</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Link 
        href="/jams" 
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Jams
      </Link>
      
      <JamDetails 
        jam={jam} 
        onDelete={(jamId) => setConfirmDelete(true)} 
      />
      
      {/* Delete confirmation dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this jam?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the jam, remove all team associations, and any games submitted to it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteJam}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Jam"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 