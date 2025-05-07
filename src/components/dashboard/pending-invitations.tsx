'use client';

import { useState, useEffect } from 'react';
import { teamApi } from '@/lib/api/team';
import { TeamInvitation } from '@/types/team';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, Calendar, Clock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PendingInvitations() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [actionInProgress, setActionInProgress] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const data = await teamApi.getUserPendingInvitations();
        setInvitations(data);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const handleAcceptInvitation = async (invitation: TeamInvitation) => {
    setActionInProgress({ ...actionInProgress, [invitation.id]: true });
    
    try {
      const team = await teamApi.acceptInvitation(invitation.token);
      
      // Remove the invitation from the list
      setInvitations(invitations.filter(inv => inv.id !== invitation.id));
      
      toast.success(`You have joined the team "${team.name}"`);
      
      router.push(`/teams/${team.slug}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      const newActionInProgress = { ...actionInProgress };
      delete newActionInProgress[invitation.id];
      setActionInProgress(newActionInProgress);
    }
  };

  const handleRejectInvitation = async (invitation: TeamInvitation) => {
    setActionInProgress({ ...actionInProgress, [invitation.id]: true });
    
    try {
      await teamApi.rejectInvitation(invitation.token);
      
      // Remove the invitation from the list
      setInvitations(invitations.filter(inv => inv.id !== invitation.id));
      
      toast.success("You have declined the team invitation");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject invitation');
    } finally {
      const newActionInProgress = { ...actionInProgress };
      delete newActionInProgress[invitation.id];
      setActionInProgress(newActionInProgress);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>Team invitations waiting for your response</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return null; // Don't render anything if there are no invitations
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>Team invitations waiting for your response</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="border rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-medium">{invitation.teamName}</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Sent: {formatDate(invitation.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Expires: {formatDate(invitation.expiresAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRejectInvitation(invitation)}
                    disabled={actionInProgress[invitation.id]}
                  >
                    {actionInProgress[invitation.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Decline
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleAcceptInvitation(invitation)}
                    disabled={actionInProgress[invitation.id]}
                  >
                    {actionInProgress[invitation.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 