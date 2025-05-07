import { useEffect, useState } from 'react';
import Link from 'next/link';
import { teamApi } from '@/lib/api/team';
import { Team, TeamRole } from '@/types/team';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { AlertCircle, ArrowRight, Plus, Users, Calendar, RefreshCw, UserPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

export default function TeamList() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const data = await teamApi.getUserTeams();
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTeams();
  };

  useEffect(() => {
    loadTeams();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Teams</h1>
          <p className="text-muted-foreground mt-1">
            Manage and access teams you're part of
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/teams/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden border border-border/60">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : teams.length === 0 ? (
        <Card className="bg-muted/40 border-dashed border-2 p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <Users className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No Teams Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You're not a member of any teams yet. Create your first team to collaborate with others or wait for an invitation.
              </p>
            </div>
            <Button asChild className="mt-2">
              <Link href="/teams/create">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Your First Team
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card 
              key={team.id} 
              className="overflow-hidden transition-all hover:shadow-md hover:border-primary/20 border border-border/60 flex flex-col"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1">{team.name}</CardTitle>
                  <Badge variant={team.members.some(m => m.teamRole === 'ADMIN' && m.userId === team.id) ? "default" : "secondary"}>
                    {team.members.some(m => m.teamRole === 'ADMIN' && m.userId === team.id) ? "Owner" : "Member"}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3.5 w-3.5 opacity-70" />
                  <span>Created {formatDate(team.createdAt)}</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-grow">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 opacity-70" />
                  <span>{team.members.length} {team.members.length === 1 ? 'Member' : 'Members'}</span>
                </div>

                <div className="flex -space-x-2 mt-4">
                  {team.members.slice(0, 5).map((member) => (
                    <HoverCard key={member.id} openDelay={300} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <Avatar className="border-2 border-background h-8 w-8">
                          {member.user.avatarUrl ? (
                            <AvatarImage src={member.user.avatarUrl} alt={member.user.username || member.user.email} />
                          ) : null}
                          <AvatarFallback>
                            {(member.user.username?.charAt(0) || member.user.email.charAt(0)).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-60 p-4" align="start">
                        <div className="flex justify-between space-x-4">
                          <Avatar className="h-10 w-10">
                            {member.user.avatarUrl ? (
                              <AvatarImage src={member.user.avatarUrl} alt={member.user.username || member.user.email} />
                            ) : null}
                            <AvatarFallback>
                              {(member.user.username?.charAt(0) || member.user.email.charAt(0)).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1 flex-1">
                            <h4 className="text-sm font-semibold">{member.user.username || 'Anonymous'}</h4>
                            <p className="text-xs text-muted-foreground break-all">{member.user.email}</p>
                            <div className="flex items-center pt-1">
                              <Badge variant={member.teamRole === 'ADMIN' ? "default" : "outline"} className="text-[10px] px-1 h-5">
                                {member.teamRole}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                  
                  {team.members.length > 5 && (
                    <Avatar className="border-2 border-background bg-muted h-8 w-8">
                      <AvatarFallback>+{team.members.length - 5}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-4">
                <Button asChild variant="default" className="w-full group">
                  <Link href={`/teams/${team.slug}`}>
                    View Team
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 