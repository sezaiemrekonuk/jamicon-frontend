"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { gameApi } from "@/lib/api/game";
import { GameDto, PhotoInfo, BuildInfo } from "@/types/game";
import { formatBytes, formatDate } from "@/lib/utils";
import { ArrowLeft, Clock, Download, Globe, Shield, Tag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/providers/auth-provider";
import { toast } from "sonner";

export default function GameDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [game, setGame] = useState<GameDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<PhotoInfo | null>(null);
  const [otherPhotos, setOtherPhotos] = useState<PhotoInfo[]>([]);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        const data = await gameApi.getGameBySlug(slug);
        setGame(data);
        
        // Separate cover photo from other photos
        const cover = data.photos.find(p => p.isCover) || data.photos[0] || null;
        setCoverPhoto(cover);
        setOtherPhotos(data.photos.filter(p => p !== cover));
      } catch (err) {
        console.error("Error loading game:", err);
        setError("Failed to load game details");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchGame();
    }
  }, [slug]);

  const handleDownload = (build: BuildInfo) => {
    if (!user) {
      toast.error("Please log in to download this game");
      return;
    }
    
    // Open the download link in a new tab
    window.open(build.url, "_blank");
    toast.success("Download started");
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-muted"></div>
            <div className="h-4 w-24 rounded bg-muted"></div>
          </div>
          <div className="h-8 w-2/3 rounded bg-muted"></div>
          <div className="aspect-video w-full rounded-lg bg-muted"></div>
          <div className="h-32 rounded bg-muted"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 rounded bg-muted"></div>
            <div className="h-40 rounded bg-muted"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Game Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || "The game you're looking for doesn't exist or has been removed."}
          </p>
          <Button asChild>
            <Link href="/jams">Explore Game Jams</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="gap-1 mb-4">
          <Link href="/jams">
            <ArrowLeft className="h-4 w-4" /> Back to Jams
          </Link>
        </Button>
        
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <Badge variant="outline" className="bg-primary/10 px-2 py-0.5">
            <Globe className="h-3 w-3 mr-1" />
            {game.visibility}
          </Badge>
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5">
            <Shield className="h-3 w-3 mr-1" />
            {game.contentRating}
          </Badge>
          <div className="text-sm text-muted-foreground">
            <Clock className="h-3 w-3 inline mr-1" />
            Uploaded {formatDate(game.createdAt)}
          </div>
        </div>
        
        <h1 className="text-3xl font-bold">{game.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Media Section */}
          <div>
            {coverPhoto ? (
              <div className="rounded-lg overflow-hidden aspect-video bg-accent relative mb-4">
                <Image
                  src={coverPhoto.url}
                  alt={game.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden aspect-video bg-accent flex items-center justify-center mb-4">
                <Shield className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            
            {otherPhotos.length > 0 && (
              <Carousel className="w-full">
                <CarouselContent>
                  {otherPhotos.map((photo) => (
                    <CarouselItem key={photo.id} className="basis-1/2 md:basis-1/3">
                      <div className="aspect-video relative rounded-md overflow-hidden bg-accent">
                        <Image
                          src={photo.url}
                          alt={game.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            )}
          </div>
          
          {/* Game Tabs */}
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">About This Game</h2>
                  <p className="text-muted-foreground">
                    {/* A placeholder description until we have real descriptions in the model */}
                    This is a game created for a game jam. Download and play to experience the creativity
                    and talent behind this project!
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="requirements" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">System Requirements</h2>
                  <p className="text-muted-foreground">
                    Requirements vary by platform and build. Check the download section for details about
                    each available build.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comments" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Comments</h2>
                  <p className="text-center text-muted-foreground py-8">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                  {/* Comment form would go here - to be implemented later */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          {/* Download Section */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Download</h2>
              
              {game.builds.length > 0 ? (
                <div className="space-y-4">
                  {game.builds.map((build) => (
                    <div key={build.id} className="bg-accent/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">Version {build.version}</h3>
                          <p className="text-xs text-muted-foreground">
                            {build.platform} • {formatBytes(build.fileSize)}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleDownload(build)}
                          disabled={!user}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                      
                      {!user && (
                        <p className="text-xs text-muted-foreground mt-2">
                          <Link href="/sign-in" className="text-primary underline">
                            Sign in
                          </Link>{" "}
                          to download this game
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No downloads available.</p>
              )}
            </CardContent>
          </Card>
          
          {/* Team Info */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Developed By</h2>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-accent flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">Team</h3>
                  <Link 
                    href={`/teams/${game.teamId}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View Team Profile
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 