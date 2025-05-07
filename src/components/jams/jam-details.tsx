"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/providers/auth-provider";
import { GameInfo, JamWithTeamsAndGames, TeamInfo, Visibility } from "@/types/jam";
import { Team } from "@/types/team";
import { CalendarDays, Clock, Edit, Globe, LinkIcon, Shield, Trash, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { JamTeamInviteButton } from "@/components/jams/jam-team-invite-button";
import { JamTeamRequestButton } from "@/components/jams/jam-team-request-button";
import { JamTeamNotifications } from "@/components/ui/jam-team-notifications";
import { JamTeamsList } from "@/components/jams/jam-teams-list";
import { teamApi } from "@/lib/api/team";

interface JamDetailsProps {
  jam: JamWithTeamsAndGames;
  onDelete?: (jamId: string) => void;
}

export function JamDetails({ jam, onDelete }: JamDetailsProps) {
  const { user } = useAuth();
  const isOwner = user?.id === jam.createdByUserId;
  const [teams, setTeams] = useState(jam.teams || []);
  const games = jam.games || [];
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [teamsEligibleToApply, setTeamsEligibleToApply] = useState<Team[]>([]);
  
  // Function to search teams
  const searchTeams = async (query: string): Promise<Team[]> => {
    try {
      return await teamApi.searchTeams(query);
    } catch (error) {
      console.error("Error searching teams:", error);
      return [];
    }
  };
  
  // Load user's teams for the request button
  useEffect(() => {
    const loadUserTeams = async () => {
      if (!user) return;
      
      setIsLoadingTeams(true);
      try {
        const teams = await teamApi.getUserTeams();
        setUserTeams(teams);
        
        // Filter teams that are already in the jam
        const jamTeamIds = jam.teams?.map(team => team.id) || [];
        const eligibleTeams = teams.filter(team => !jamTeamIds.includes(team.id));
        setTeamsEligibleToApply(eligibleTeams);
      } catch (error) {
        console.error("Error loading user teams:", error);
      } finally {
        setIsLoadingTeams(false);
      }
    };
    
    loadUserTeams();
  }, [user, jam.teams]);

  // Set initial teams when jam prop changes
  useEffect(() => {
    setTeams(jam.teams || []);
  }, [jam]);
  
  const getTimeStatus = () => {
    const now = new Date();
    const startDate = new Date(jam.startDate);
    const endDate = new Date(jam.endDate);
    
    if (now < startDate) {
      return {
        label: "Upcoming",
        message: `Starts ${formatDistanceToNow(startDate, { addSuffix: true })}`,
        className: "text-yellow-600",
      };
    } else if (now >= startDate && now <= endDate) {
      return {
        label: "Active",
        message: `Ends ${formatDistanceToNow(endDate, { addSuffix: true })}`,
        className: "text-green-600",
      };
    } else {
      return {
        label: "Ended",
        message: `Ended ${formatDistanceToNow(endDate, { addSuffix: true })}`,
        className: "text-gray-600",
      };
    }
  };

  // Handler for team acceptance to update teams list immediately
  const handleTeamAccepted = (teamId: string, teamName: string, teamSlug: string) => {
    // Check if team already exists in the list
    if (!teams.some(team => team.id === teamId)) {
      setTeams(prevTeams => [...prevTeams, { id: teamId, name: teamName, slug: teamSlug }]);
      
      // Remove this team from eligible teams
      setTeamsEligibleToApply(prev => prev.filter(team => team.id !== teamId));
    }
  };
  
  const getVisibilityText = () => {
    switch (jam.visibility) {
      case Visibility.PUBLIC:
        return {
          icon: <Globe className="h-4 w-4 text-green-500" />,
          text: "Public - Anyone can view this jam",
        };
      case Visibility.UNLISTED:
        return {
          icon: <LinkIcon className="h-4 w-4 text-yellow-500" />,
          text: "Unlisted - Only accessible with the link",
        };
      case Visibility.PRIVATE:
        return {
          icon: <Shield className="h-4 w-4 text-blue-500" />,
          text: "Private - Only visible to participants",
        };
      case Visibility.DRAFT:
        return {
          icon: <Clock className="h-4 w-4 text-gray-500" />,
          text: "Draft - Only visible to you",
        };
      default:
        return {
          icon: <Globe className="h-4 w-4" />,
          text: "Unknown visibility",
        };
    }
  };
  
  const timeStatus = getTimeStatus();
  const visibility = getVisibilityText();
  
  return (
    <div className="space-y-8">
      {/* Header with banner and basic info */}
      <div className="space-y-4">
        <div className="relative h-48 sm:h-64 lg:h-80 bg-accent rounded-lg overflow-hidden">
          {jam.bannerUrl ? (
            <Image 
              src={jam.bannerUrl} 
              alt={jam.name} 
              fill 
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <CalendarDays className="h-24 w-24 text-muted" />
            </div>
          )}
          
          {jam.logoUrl && (
            <div className="absolute bottom-4 left-4 h-16 w-16 sm:h-20 sm:w-20 bg-background rounded-lg shadow-lg p-2">
              <div className="relative h-full w-full">
                <Image 
                  src={jam.logoUrl} 
                  alt={`${jam.name} logo`} 
                  fill 
                  className="object-contain"
                />
              </div>
            </div>
          )}
          
          <div className="absolute top-4 right-4 flex gap-2">
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
            <Badge 
              variant="outline" 
              className={`bg-white/90 dark:bg-black/90 ${timeStatus.className}`}
            >
              {timeStatus.label}
            </Badge>
          </div>
          
          {isOwner && (
            <div className="absolute top-4 left-4">
              <Badge variant="outline" className="bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400">
                You created this jam
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{jam.name}</h1>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {jam.tags && jam.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
          
          {isOwner && (
            <div className="flex flex-shrink-0 gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/jams/${jam.slug}/edit`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
              
              {onDelete && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onDelete(jam.id)}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Main content with tabs */}
      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="teams">
            Teams ({teams.length})
          </TabsTrigger>
          <TabsTrigger value="games">
            Games ({games.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Timeline</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(jam.startDate), "PPP")} - {format(new Date(jam.endDate), "PPP")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <p className="text-sm text-muted-foreground">
                          {timeStatus.message}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {visibility.icon}
                      <div>
                        <p className="text-sm font-medium">Visibility</p>
                        <p className="text-sm text-muted-foreground">
                          {visibility.text}
                        </p>
                      </div>
                    </div>
                    
                    {jam.theme && (
                      <div>
                        <p className="text-sm font-medium">Theme</p>
                        <p className="text-sm text-muted-foreground">{jam.theme}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  
                  {jam.description ? (
                    <div className="prose dark:prose-invert prose-sm max-w-none">
                      <p>{jam.description}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No description provided.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="teams" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Participating Teams</h3>
            <div className="flex gap-2">
              {isOwner && (
                <JamTeamInviteButton
                  jamId={jam.id}
                  jamName={jam.name}
                  searchTeams={searchTeams}
                  className="ml-auto"
                />
              )}
              {!isOwner && user && !isLoadingTeams && teamsEligibleToApply.length > 0 && (
                <JamTeamRequestButton
                  jamId={jam.id}
                  jamName={jam.name}
                  jamSlug={jam.slug}
                  userTeams={teamsEligibleToApply}
                />
              )}
            </div>
          </div>

          {/* Show team notifications if any */}
          {user && <JamTeamNotifications 
                     jamId={jam.id} 
                     className="mb-6" 
                     onTeamAccepted={handleTeamAccepted}
                    />}

          {teams.length > 0 ? (
            <JamTeamsList 
              jamId={jam.id}
              jamName={jam.name}
              teams={teams.map(team => ({
                id: team.id,
                name: team.name,
                slug: team.slug
              }))}
              canManage={isOwner}
            />
          ) : (
            <Card>
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">
                  No teams are participating in this jam yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="games" className="space-y-4">
          {games.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">
                  No games have been submitted to this jam yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TeamCard({ team }: { team: TeamInfo }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-10 w-10 relative bg-accent rounded-md overflow-hidden">
            {team.avatarUrl ? (
              <Image
                src={team.avatarUrl}
                alt={team.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-grow">
            <h3 className="font-medium truncate">{team.name}</h3>
            <Link 
              href={`/teams/${team.slug}`} 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View Team
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GameCard({ game }: { game: GameInfo }) {
  return (
    <Card className={game.isHighlighted ? "border-2 border-amber-500" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{game.name}</h3>
              {game.isHighlighted && (
                <Badge variant="default" className="bg-amber-500">
                  Highlighted
                </Badge>
              )}
            </div>
            <Link 
              href={`/games/${game.slug}`} 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View Game
            </Link>
          </div>
        </div>
        
        {game.submittedAt && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Submitted {formatDistanceToNow(new Date(game.submittedAt), { addSuffix: true })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 