"use client";

import { Jam } from "@/types/jam";
import { JamCard } from "./jam-card";
import { Skeleton } from "@/components/ui/skeleton";

interface JamGridProps {
  jams: Jam[];
  loading?: boolean;
  emptyMessage?: string;
  variant?: "default" | "compact";
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function JamGrid({
  jams,
  loading = false,
  emptyMessage = "No jams found",
  variant = "default",
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
}: JamGridProps) {
  const getGridClasses = () => {
    const gridCols = [];
    
    if (columns.sm) gridCols.push(`grid-cols-${columns.sm}`);
    if (columns.md) gridCols.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) gridCols.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) gridCols.push(`xl:grid-cols-${columns.xl}`);
    
    return gridCols.join(" ");
  };

  if (loading) {
    return (
      <div className={`grid gap-4 ${getGridClasses()}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <JamGridSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (jams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${getGridClasses()}`}>
      {jams.map((jam) => (
        <JamCard key={jam.id} jam={jam} variant={variant} />
      ))}
    </div>
  );
}

interface JamGridSkeletonProps {
  variant?: "default" | "compact";
}

function JamGridSkeleton({ variant = "default" }: JamGridSkeletonProps) {
  if (variant === "compact") {
    return (
      <div className="border rounded-md overflow-hidden">
        <div className="flex">
          <Skeleton className="w-24 h-20" />
          <div className="p-3 w-full">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Skeleton className="h-36 w-full" />
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  );
} 