"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Jam, Visibility } from "@/types/jam";
import { CalendarDays, Clock, Edit, Globe, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/providers/auth-provider";
import { Button } from "@/components/ui/button";

interface JamCardProps {
  jam: Jam;
  variant?: "default" | "compact";
  showCreator?: boolean;
}

export function JamCard({ jam, variant = "default", showCreator = true }: JamCardProps) {
  const { user } = useAuth();
  const isCreator = user?.id === jam.createdByUserId;
  
  const isActive = () => {
    const now = new Date();
    const startDate = new Date(jam.startDate);
    const endDate = new Date(jam.endDate);
    return now >= startDate && now <= endDate;
  };

  const getStatusBadge = () => {
    const now = new Date();
    const startDate = new Date(jam.startDate);
    const endDate = new Date(jam.endDate);

    if (now < startDate) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Upcoming
        </Badge>
      );
    } else if (now >= startDate && now <= endDate) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Active
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Ended
        </Badge>
      );
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const startDate = new Date(jam.startDate);
    const endDate = new Date(jam.endDate);

    if (now < startDate) {
      return `Starts ${formatDistanceToNow(startDate, { addSuffix: true })}`;
    } else if (now >= startDate && now <= endDate) {
      return `Ends ${formatDistanceToNow(endDate, { addSuffix: true })}`;
    } else {
      return `Ended ${formatDistanceToNow(endDate, { addSuffix: true })}`;
    }
  };

  const getVisibilityIcon = () => {
    switch (jam.visibility) {
      case Visibility.PUBLIC:
        return <Globe className="h-4 w-4 text-green-500" />;
      case Visibility.UNLISTED:
        return <Globe className="h-4 w-4 text-yellow-500" />;
      case Visibility.PRIVATE:
        return <Users className="h-4 w-4 text-blue-500" />;
      case Visibility.DRAFT:
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  if (variant === "compact") {
    return (
      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
        <Link href={`/jams/${jam.slug}`} className="block h-full">
          <div className="flex h-full">
            <div className="w-24 h-full relative bg-accent">
              {jam.logoUrl ? (
                <Image 
                  src={jam.logoUrl} 
                  alt={jam.name} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CalendarDays className="h-8 w-8 text-muted" />
                </div>
              )}
              {isCreator && (
                <div className="absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white transform translate-x-1 -translate-y-1" 
                     title="You created this jam" />
              )}
            </div>
            <div className="flex flex-col flex-grow p-3">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium line-clamp-1 flex-grow">{jam.name}</h3>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 mb-1">{getTimeRemaining()}</p>
              {showCreator && jam.createdBy && (
                <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                  Created by {jam.createdBy.username || "Anonymous"}
                </p>
              )}
              <div className="flex items-center justify-between mt-auto">
                {jam.tags && jam.tags.length > 0 && (
                  <div className="flex gap-1 overflow-hidden">
                    {jam.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                    {jam.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{jam.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
                {isCreator && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                    <Link href={`/jams/${jam.slug}/edit`}>
                      <Edit className="h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
      <div className="h-full flex flex-col">
        <Link href={`/jams/${jam.slug}`} className="block flex-grow">
          <div className="relative h-36 bg-accent">
            {jam.bannerUrl ? (
              <Image
                src={jam.bannerUrl}
                alt={jam.name}
                fill
                className="object-cover"
              />
            ) : jam.logoUrl ? (
              <div className="w-full h-full flex items-center justify-center">
                <Image
                  src={jam.logoUrl}
                  alt={jam.name}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CalendarDays className="h-12 w-12 text-muted" />
              </div>
            )}
            <div className="absolute top-2 right-2 flex gap-1">
              {jam.isFeatured && (
                <Badge variant="default" className="bg-purple-500">
                  Featured
                </Badge>
              )}
              {jam.isTrending && (
                <Badge variant="default" className="bg-orange-500">
                  Trending
                </Badge>
              )}
            </div>
            {isCreator && (
              <div className="absolute top-2 left-2">
                <Badge variant="outline" className="bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400">
                  Your jam
                </Badge>
              </div>
            )}
          </div>
          
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg line-clamp-1">{jam.name}</h3>
              {getStatusBadge()}
            </div>
          </CardHeader>
          
          <CardContent className="pb-2">
            {jam.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {jam.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>{getTimeRemaining()}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              {getVisibilityIcon()}
              <span>
                {jam.visibility === Visibility.PUBLIC
                  ? "Public"
                  : jam.visibility === Visibility.UNLISTED
                  ? "Unlisted"
                  : jam.visibility === Visibility.PRIVATE
                  ? "Private"
                  : "Draft"}
              </span>
            </div>
            
            {showCreator && jam.createdBy && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Link href={`/profile/${jam.createdBy.id}`} className="hover:text-primary transition-colors">
                  Created by {jam.createdBy.username || "Anonymous"}
                </Link>
              </div>
            )}
          </CardContent>
        </Link>
        
        <CardFooter className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {jam.tags && jam.tags.length > 0 ? (
              jam.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No tags</span>
            )}
          </div>
          
          {isCreator && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/jams/${jam.slug}/edit`}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
          )}
        </CardFooter>
      </div>
    </Card>
  );
} 