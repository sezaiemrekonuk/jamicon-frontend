"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, X, ExternalLink } from "lucide-react";
import { jamTeamApi } from "@/lib/api/jam-team";
import { TeamJam, TeamJamStatus } from "@/types/jam-team";
import Link from "next/link";
import { formatDate, formatDateRange } from "@/lib/utils";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TeamJamsProps {
  teamId: string;
  isAdmin: boolean;
}

export function TeamJams({ teamId, isAdmin }: TeamJamsProps) {
  const [jams, setJams] = useState<TeamJam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelingRequestIds, setCancelingRequestIds] = useState<string[]>([]);

  useEffect(() => {
    const loadTeamJams = async () => {
      setIsLoading(true);
      try {
        const teamJams = await jamTeamApi.getTeamJams(teamId);
        setJams(teamJams);
      } catch (error) {
        console.error("Error loading team jams:", error);
        toast.error("Failed to load jams for this team");
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamJams();
  }, [teamId]);

  const handleCancelRequest = async (requestId: string) => {
    setCancelingRequestIds((prev) => [...prev, requestId]);
    try {
      await jamTeamApi.cancelJamTeamRequest(requestId);
      setJams((prevJams) => prevJams.filter((jam) => jam.requestId !== requestId));
      toast.success("Jam request canceled successfully");
    } catch (error) {
      console.error("Error canceling jam request:", error);
      toast.error("Failed to cancel jam request");
    } finally {
      setCancelingRequestIds((prev) => prev.filter((id) => id !== requestId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (jams.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              This team is not participating in any jams yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group jams by status
  const participating = jams.filter((jam) => jam.status === TeamJamStatus.PARTICIPATING);
  const pastJams = jams.filter((jam) => jam.status === TeamJamStatus.PAST);
  const pending = jams.filter(
    (jam) => jam.status === TeamJamStatus.INVITED || jam.status === TeamJamStatus.REQUESTED
  );

  const getStatusBadge = (status: TeamJamStatus) => {
    switch (status) {
      case TeamJamStatus.PARTICIPATING:
        return <Badge className="bg-green-500">Participating</Badge>;
      case TeamJamStatus.INVITED:
        return <Badge className="bg-blue-500">Invited</Badge>;
      case TeamJamStatus.REQUESTED:
        return <Badge className="bg-yellow-500">Requested</Badge>;
      case TeamJamStatus.PAST:
        return <Badge variant="outline">Past</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={participating.length > 0 ? "active" : pending.length > 0 ? "pending" : "past"}>
        <TabsList className="mb-4">
          <TabsTrigger value="active" disabled={participating.length === 0}>
            Active ({participating.length})
          </TabsTrigger>
          <TabsTrigger value="pending" disabled={pending.length === 0}>
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="past" disabled={pastJams.length === 0}>
            Past ({pastJams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Jams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {participating.map((jam) => (
                  <div key={jam.jamId} className="flex items-center justify-between border rounded-lg p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{jam.jamName}</h3>
                        {getStatusBadge(jam.status)}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateRange(new Date(jam.startDate), new Date(jam.endDate))}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/jams/${jam.jamSlug}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Jam
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Jams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pending.map((jam) => (
                  <div key={jam.jamId} className="flex items-center justify-between border rounded-lg p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{jam.jamName}</h3>
                        {getStatusBadge(jam.status)}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateRange(new Date(jam.startDate), new Date(jam.endDate))}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isAdmin && jam.status === TeamJamStatus.REQUESTED && jam.requestId && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleCancelRequest(jam.requestId!)}
                                disabled={cancelingRequestIds.includes(jam.requestId!)}
                              >
                                {cancelingRequestIds.includes(jam.requestId!) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                                <span className="ml-2">Cancel Request</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cancel this jam participation request</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/jams/${jam.jamSlug}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Jam
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Past Jams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastJams.map((jam) => (
                  <div key={jam.jamId} className="flex items-center justify-between border rounded-lg p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{jam.jamName}</h3>
                        {getStatusBadge(jam.status)}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateRange(new Date(jam.startDate), new Date(jam.endDate))}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/jams/${jam.jamSlug}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Jam
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 