'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { acceptInvitation, rejectInvitation } from '@/lib/services/team-service';
import { Team } from '@/types/team';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/providers/auth-provider';

export default function InvitationPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const router = useRouter();
  const { user, status } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    // Check auth status on load - if not logged in, redirect to login
    const checkAuth = async () => {
      try {
        if (status === 'unauthenticated') {
          // Redirect to login and store the invitation URL to redirect back after login
          localStorage.setItem('redirectAfterLogin', window.location.pathname);
          router.push('/login');
          return;
        }
        
        if (status === 'authenticated') {
          setIsLoading(false);
        }
      } catch (err) {
        setError('Authentication error. Please try again.');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [status, router]);

  const handleAcceptInvitation = async () => {
    if (!token) {
      setError('Invalid invitation token');
      return;
    }
    
    setIsAccepting(true);
    setError(null);
    
    try {
      const acceptedTeam = await acceptInvitation(token);
      setTeam(acceptedTeam);
      setSuccess(true);
      toast.success(`You have joined the team "${acceptedTeam.name}"`);
      
      // Redirect to team page after 2 seconds
      setTimeout(() => {
        router.push(`/teams/${acceptedTeam.slug}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
      toast.error(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectInvitation = async () => {
    if (!token) {
      setError('Invalid invitation token');
      return;
    }
    
    setIsRejecting(true);
    setError(null);
    
    try {
      await rejectInvitation(token);
      toast.success("You have declined the team invitation");
      
      // Redirect to teams page after 2 seconds
      setTimeout(() => {
        router.push('/teams');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject invitation');
      toast.error(err instanceof Error ? err.message : 'Failed to reject invitation');
    } finally {
      setIsRejecting(false);
    }
  };

  // Show loading state during authentication check
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading invitation...</p>
      </div>
    );
  }

  if (success) {
    return (
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Invitation Accepted
          </CardTitle>
          <CardDescription>
            You have successfully joined the team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <p className="text-center mb-2 text-lg font-medium">
              You are now a member of <span className="font-semibold">{team?.name}</span>
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Redirecting to team page...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Invitation</CardTitle>
        <CardDescription>
          You have been invited to join a team
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        <div className="flex flex-col items-center py-6">
          <div className="bg-primary/10 rounded-full p-4 mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <p className="text-center mb-4">
            Would you like to join this team? You can always leave later.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleRejectInvitation}
          disabled={isAccepting || isRejecting}
        >
          {isRejecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Declining...
            </>
          ) : (
            <>
              <XCircle className="mr-2 h-4 w-4" />
              Decline
            </>
          )}
        </Button>
        <Button 
          className="flex-1"
          onClick={handleAcceptInvitation}
          disabled={isAccepting || isRejecting}
        >
          {isAccepting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Accepting...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 