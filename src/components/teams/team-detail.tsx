import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  fetchTeamBySlug, 
  deleteTeam, 
  updateTeam, 
  removeMember, 
  transferTeamOwnership,
  createInvitation,
  getTeamPendingInvitations,
  cancelInvitation,
  resendInvitation
} from '@/lib/services/team-service';
import { Team, TeamMember, TeamRole, UpdateTeamRequest } from '@/types/team';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { formatDate, slugify } from '@/lib/utils';
import { 
  AlertCircle, 
  Settings, 
  Trash, 
  Edit, 
  UserPlus, 
  Users, 
  Shield, 
  Mail, 
  Calendar, 
  Clock, 
  Loader2, 
  Info
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TeamJams } from '@/components/teams/team-jams';
import { jamTeamApi } from '@/lib/api/jam-team';
import { gameApi } from '@/lib/api/game';
import { waitlistApi } from '@/lib/api/waitlist';
import { teamApi as teamRequestApi } from '@/lib/api/team';
import { TeamJoinRequest } from '@/types/team-join-request';

interface TeamDetailProps {
  slug: string;
  currentUserId: string;
}

// Define the form schema with zod for validation
const editTeamSchema = z.object({
  name: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }).max(50, {
    message: "Team name must not exceed 50 characters."
  }),
  slug: z.string().regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens.",
  }).optional(),
});

const inviteFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

interface MemberCardProps {
  member: TeamMember;
  isAdmin: boolean;
  isCurrentUser: boolean;
  onRemove: () => void;
  onTransferOwnership: () => void;
  isRemoving?: boolean;
}

export default function TeamDetail({ slug, currentUserId }: TeamDetailProps) {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [isListed, setIsListed] = useState<boolean>(false);
  const [listingLoading, setListingLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<{ id: string; email: string; createdAt: Date; expiresAt: Date }[]>([]);
  
  // Edit team dialog state
  const [editTeamOpen, setEditTeamOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Edit form with react-hook-form and zod validation
  const editForm = useForm<z.infer<typeof editTeamSchema>>({
    resolver: zodResolver(editTeamSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });
  
  // Invite member dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  
  // Invite form with react-hook-form
  const inviteForm = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
    },
  });
  
  // Add state for admin transfer dialog
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [memberToPromote, setMemberToPromote] = useState<TeamMember | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isRemoving, setIsRemoving] = useState<{[key: string]: boolean}>({});
  const [teamJamsData, setTeamJamsData] = useState<any[]>([]);
  const [uploadJams, setUploadJams] = useState<any[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { register, handleSubmit, reset } = useForm<{jamId: string; name: string; slug: string; build: FileList; photos: FileList}>();

  // Join request state (for team admins)
  const [joinRequests, setJoinRequests] = useState<TeamJoinRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Check if current user is admin
  const isAdmin = team?.members.some(
    (member) => member.userId === currentUserId && member.teamRole === 'ADMIN'
  ) || false;

  useEffect(() => {
    const loadTeam = async () => {
      try {
        setIsLoading(true);
        const teamData = await fetchTeamBySlug(slug);
        setTeam(teamData);
        
        // Update edit form with team data
        editForm.reset({
          name: teamData.name,
          slug: teamData.slug
        });
        
        // If user is admin, fetch pending invitations
        if (teamData.members.some(
          (member) => member.userId === currentUserId && member.teamRole === 'ADMIN'
        )) {
          const invitations = await getTeamPendingInvitations(teamData.id);
          setPendingInvitations(invitations);
        }

        // After loading team, load join requests if admin
        if (teamData.members.some(m => m.userId === currentUserId && m.teamRole === 'ADMIN')) {
          setIsLoadingRequests(true);
          try {
            const requests = await teamRequestApi.getTeamJoinRequests(teamData.id);
            setJoinRequests(requests);
          } catch (e) {
            console.error('Error fetching join requests', e);
          } finally {
            setIsLoadingRequests(false);
          }
        }
      } catch (err) {
        console.error('Team loading error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load team details');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeam();
  }, [slug, currentUserId, editForm]);

  // After team loads, fetch team jams
  useEffect(() => {
    if (!team) return;
    const loadTeamJams = async () => {
      try {
        const data = await jamTeamApi.getTeamJams(team.id);
        setTeamJamsData(data);
        
        // Filter jams that are:
        // 1. The team is participating in
        // 2. Currently active (within start and end dates)
        const now = new Date();
        const activeJams = data.filter((j: any) => {
          const isParticipating = j.status === 'participating';
          if (!j || !j.startDate || !j.endDate) return false;
          const startDate = new Date(j.startDate);
          const endDate = new Date(j.endDate);
          const isActive = now >= startDate && now <= endDate;
          return isParticipating && isActive;
        });
        
        setUploadJams(activeJams);
      } catch (err) {
        console.error('Error loading team jams:', err);
      }
    };
    loadTeamJams();
  }, [team]);

  useEffect(() => {
    if (!team) return;
    // Check if this team is already listed globally
    const checkListing = async () => {
      try {
        const listings = await waitlistApi.getGlobalWaitlists();
        setIsListed(listings.some(l => l.teamId === team.id));
      } catch {
        // ignore
      }
    };
    checkListing();
  }, [team]);

  const handleEditTeam = async (values: z.infer<typeof editTeamSchema>) => {
    if (!team) return;
    
    setIsUpdating(true);
    try {
      // Create request data, ensuring slug is set if missing
      const requestData: UpdateTeamRequest = {
        name: values.name,
        slug: values.slug || slugify(values.name)
      };
      
      const updatedTeam = await updateTeam(team.id, requestData);
      setTeam(updatedTeam);
      setEditTeamOpen(false);
      toast.success("Team details have been updated successfully");
      
      // If slug changed, redirect to new URL
      if (updatedTeam.slug !== slug) {
        router.push(`/teams/${updatedTeam.slug}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update team');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    
    if (window.confirm(`Are you sure you want to delete the team "${team.name}"? This action cannot be undone.`)) {
      try {
        await deleteTeam(team.id);
        toast.success("The team has been permanently deleted");
        router.push('/teams');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete team');
      }
    }
  };

  const handleTransferOwnership = async () => {
    if (!team || !memberToPromote) return;
    
    setIsTransferring(true);
    try {
      const updatedTeam = await transferTeamOwnership(team.id, memberToPromote.userId);
      setTeam(updatedTeam);
      toast.success("Team ownership has been transferred successfully");
      setTransferDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to transfer ownership');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!team) return;
    
    // Set the specific member to loading state
    setIsRemoving(prev => ({ ...prev, [memberId]: true }));
    
    try {
      // Find the member to get the user ID
      const memberToRemove = team.members.find(m => m.id === memberId);
      
      if (!memberToRemove) {
        throw new Error('Member not found in team');
      }
      
      const updatedTeam = await removeMember(team.id, memberToRemove.userId);
      setTeam(updatedTeam);
      toast.success("The member has been removed from the team");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      // Clear the loading state for this member
      setIsRemoving(prev => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
    }
  };

  const handleInviteMember = async (values: z.infer<typeof inviteFormSchema>) => {
    if (!team) return;
    
    setInviteLoading(true);
    try {
      await createInvitation({
        teamId: team.id,
        email: values.email
      });
      
      // Refresh the pending invitations list
      const invitations = await getTeamPendingInvitations(team.id);
      setPendingInvitations(invitations);
      
      inviteForm.reset();
      setInviteOpen(false);
      toast.success(`An invitation has been sent to ${values.email}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!team) return;
    
    try {
      await cancelInvitation(team.id, invitationId);
      
      // Refresh the pending invitations list
      const invitations = await getTeamPendingInvitations(team.id);
      setPendingInvitations(invitations);
      
      toast.success("The invitation has been cancelled successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel invitation');
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    if (!team) return;
    
    try {
      await resendInvitation(team.id, invitationId);
      toast.success("The invitation has been resent successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend invitation');
    }
  };

  // List this team on the global waitlist
  const handleListTeam = async () => {
    if (!team) return;
    setListingLoading(true);
    try {
      await waitlistApi.listTeam(team.id);
      setIsListed(true);
      toast.success('Your team is now looking for members');
    } catch (err: any) {
      console.error('List team error:', err);
      toast.error(err.response?.data?.message || 'Failed to list team for waitlist');
    } finally {
      setListingLoading(false);
    }
  };

  // Remove this team from the global waitlist
  const handleUnlistTeam = async () => {
    if (!team) return;
    setListingLoading(true);
    try {
      await waitlistApi.unlistTeam(team.id);
      setIsListed(false);
      toast.success('Your team is no longer looking for members');
    } catch (err: any) {
      console.error('Unlist team error:', err);
      toast.error(err.response?.data?.message || 'Failed to remove team from waitlist');
    } finally {
      setListingLoading(false);
    }
  };

  const onUpload: SubmitHandler<{jamId: string; name: string; slug: string; build: FileList; photos: FileList}> = async (data) => {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('teamId', team!.id);
      formData.append('name', data.name);
      formData.append('slug', data.slug || data.name.toLowerCase().replace(/\s+/g, '-'));
      
      // Make sure build file is attached
      if (data.build && data.build[0]) {
        console.log('Attaching build file:', data.build[0].name);
        formData.append('build', data.build[0]);
      } else {
        toast.error('Please select a build file');
        setIsUploading(false);
        return;
      }
      
      // Add photos if any
      if (data.photos) {
        Array.from(data.photos).forEach((photo: File, index: number) => {
          console.log(`Attaching photo ${index}:`, photo.name);
          formData.append('photos', photo);
        });
      }
      
      // Show loading state
      const loadingToast = toast.loading('Uploading game...');
      
      const newGame = await gameApi.uploadGameToJam(data.jamId, formData);
      
      toast.dismiss(loadingToast);
      toast.success('Game uploaded successfully!');
      setIsUploadOpen(false);
      reset();
      
      // Refresh page to show the new game
      window.location.reload();
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to upload game';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!team) return;
    try {
      await teamRequestApi.acceptJoinRequest(team.id, requestId);
      setJoinRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success('Join request accepted');
      // Optionally refresh team members
      const updated = await fetchTeamBySlug(slug);
      setTeam(updated);
    } catch (e: any) {
      toast.error(e.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!team) return;
    try {
      await teamRequestApi.rejectJoinRequest(team.id, requestId);
      setJoinRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success('Join request rejected');
    } catch (e: any) {
      toast.error(e.message || 'Failed to reject request');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-14 w-full" />
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-2xl my-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Access Denied
          </CardTitle>
          <CardDescription>Unable to access team information</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground mb-4">
            You may not have permission to access this team or the team might not exist.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/teams')}>
            Back to Teams
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!team) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 z-0"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xl">
                      {team.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(team.createdAt)}</span>
                  <span className="mx-2">•</span>
                  <Users className="h-4 w-4" />
                  <span>{team.members.length} {team.members.length === 1 ? 'Member' : 'Members'}</span>
                </div>
              </div>
              
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Dialog open={editTeamOpen} onOpenChange={setEditTeamOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Team
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Team</DialogTitle>
                        <DialogDescription>
                          Make changes to your team's name and URL slug.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(handleEditTeam)} className="space-y-4 py-2">
                          <FormField
                            control={editForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Team Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="My Team" autoComplete="off" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={editForm.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL Slug</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder={slugify(editForm.watch('name') || team.name)} autoComplete="off" />
                                </FormControl>
                                <FormDescription>
                                  Used in your team URL: /teams/{field.value || slugify(editForm.watch('name') || team.name)}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter className="pt-4">
                            <Button variant="outline" type="button" onClick={() => setEditTeamOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isUpdating}>
                              {isUpdating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save Changes'
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  
                  {listingLoading ? (
                    <Button disabled size="sm" className="gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </Button>
                  ) : isListed ? (
                    <Button variant="destructive" size="sm" onClick={handleUnlistTeam}>
                      Stop Looking for Members
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={handleListTeam}>
                      Looking for Members
                    </Button>
                  )}
                  
                  <Button variant="destructive" size="sm" className="gap-2" onClick={handleDeleteTeam}>
                    <Trash className="h-4 w-4" />
                    Delete Team
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="jams" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Jams
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Requests
              </TabsTrigger>
            )}
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
        
          <TabsContent value="members" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Team Members ({team.members.length})
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isAdmin 
                    ? "Manage your team members and send invitations"
                    : "View your team members"}
                </p>
              </div>
              
              {isAdmin && (
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join this team.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...inviteForm}>
                      <form onSubmit={inviteForm.handleSubmit(handleInviteMember)} className="space-y-4 py-2">
                        <FormField
                          control={inviteForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="colleague@example.com" autoComplete="off" />
                              </FormControl>
                              <FormDescription>
                                The invitation will be sent to this email address.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter className="pt-4">
                          <Button variant="outline" type="button" onClick={() => setInviteOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={inviteLoading}>
                            {inviteLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              'Send Invitation'
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            <Card>
              <CardHeader className="py-4 px-6 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Members</CardTitle>
                  <Badge variant="outline" className="px-2 py-1">{team.members.length} {team.members.length === 1 ? 'Member' : 'Members'}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {team.members.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      isAdmin={isAdmin}
                      isCurrentUser={member.userId === currentUserId}
                      onRemove={() => handleRemoveMember(member.id)}
                      onTransferOwnership={() => {
                        setMemberToPromote(member);
                        setTransferDialogOpen(true);
                      }}
                      isRemoving={Boolean(isRemoving[member.id])}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {isAdmin && pendingInvitations.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Pending Invitations ({pendingInvitations.length})
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Invitations awaiting response
                  </p>
                </div>
                <Card>
                  <CardHeader className="py-4 px-6 border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Invitations</CardTitle>
                      <Badge variant="outline" className="px-2 py-1">{pendingInvitations.length} Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {pendingInvitations.map((invitation) => (
                        <div key={invitation.id} className="flex items-center justify-between p-4 hover:bg-accent/10 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/10 rounded-full p-2">
                              <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{invitation.email}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-muted-foreground mt-1">
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
                          </div>
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => handleResendInvitation(invitation.id)}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Resend
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Resend invitation email</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => handleCancelInvitation(invitation.id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Cancel Invitation</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Cancel invitation</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="jams" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Team Jams
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Game jams this team is participating in or has applied to
                </p>
              </div>
              {isAdmin && (
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    {uploadJams.length > 0 ? (
                      <Button variant="outline" size="sm">Upload Game</Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled title="No active jams available">
                        Upload Game
                      </Button>
                    )}
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Game to Team Jam</DialogTitle>
                    </DialogHeader>
                    {uploadJams.length > 0 ? (
                      <form onSubmit={handleSubmit(onUpload)} className="space-y-4">
                        <div>
                          <Label>Jam</Label>
                          <select {...register('jamId')} className="w-full">
                            {uploadJams.map(j => (
                              <option key={j.jamId} value={j.jamId}>{j.jamName}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Game Name</Label>
                          <Input {...register('name', { required: true })} />
                        </div>
                        <div>
                          <Label>Slug</Label>
                          <Input {...register('slug', { required: true })} />
                        </div>
                        <div>
                          <Label>Build (.zip,.7z,.rar)</Label>
                          <Input type="file" accept=".zip,.7z,.rar" {...register('build', { required: true })} />
                        </div>
                        <div>
                          <Label>Photos (optional)</Label>
                          <Input type="file" accept="image/*" multiple {...register('photos')} />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" type="button" onClick={() => setIsUploadOpen(false)} disabled={isUploading}>Cancel</Button>
                          <Button type="submit" disabled={isUploading}>
                            {isUploading ? (
                              <>
                                <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                              </>
                            ) : 'Upload'}
                          </Button>
                        </DialogFooter>
                      </form>
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-muted-foreground mb-2">No active jams available for submission</p>
                        <p className="text-sm">Your team is either not participating in any jams, or all jams are not currently active.</p>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {team && <TeamJams teamId={team.id} isAdmin={isAdmin} />}
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="requests" className="space-y-4">
              {isLoadingRequests ? (
                <p>Loading requests...</p>
              ) : joinRequests.length > 0 ? (
                <div className="space-y-4">
                  {joinRequests.map(req => (
                    <Card key={req.id}>
                      <CardContent className="flex justify-between items-center p-4">
                        <div>
                          <p className="font-medium">{req.username || 'Unknown User'}</p>
                          {req.message && <p className="text-sm text-muted-foreground">"{req.message}"</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAcceptRequest(req.id)}>Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => handleRejectRequest(req.id)}>Reject</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No pending join requests.</p>
              )}
            </TabsContent>
          )}
          
          <TabsContent value="settings" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Team Settings
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage additional team settings and preferences
                </p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure team-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="team-slug">Team URL</Label>
                    <div className="flex items-center">
                      <div className="bg-muted py-2 px-3 rounded-l-md text-muted-foreground">
                        {window.location.origin}/teams/
                      </div>
                      <Input 
                        id="team-slug" 
                        value={team.slug} 
                        readOnly 
                        className="rounded-l-none" 
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This is your team's unique URL. You can change it from the Edit Team menu.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {isAdmin && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Actions that can't be undone
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border rounded-lg p-4 border-destructive/20">
                      <div>
                        <h4 className="font-medium">Delete Team</h4>
                        <p className="text-sm text-muted-foreground">
                          Permanently remove this team and all of its data
                        </p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={handleDeleteTeam}>
                        Delete Team
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Team Ownership</DialogTitle>
            <DialogDescription>
              Are you sure you want to make {memberToPromote?.user.username || memberToPromote?.user.email} the admin of this team?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                You will no longer be the admin of this team. This action cannot be undone.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleTransferOwnership}
              disabled={isTransferring}
            >
              {isTransferring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transferring...
                </>
              ) : (
                'Confirm Transfer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MemberCard({ 
  member, 
  isAdmin, 
  isCurrentUser, 
  onRemove, 
  onTransferOwnership,
  isRemoving = false
}: MemberCardProps) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-accent/10 transition-colors rounded-lg">
      <div className="flex items-center space-x-4">
        <Avatar className="h-10 w-10 border border-border">
          <AvatarImage src={member.user.avatarUrl || undefined} alt={member.user.username || member.user.email} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {member.user.username?.[0]?.toUpperCase() || member.user.email[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">
              {member.user.username || member.user.email}
            </p>
            {isCurrentUser && <Badge variant="outline" className="text-xs px-1.5 py-0">You</Badge>}
            {member.teamRole === 'ADMIN' && (
              <Badge variant="default" className="bg-primary text-xs">Admin</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {member.user.email}
          </p>
        </div>
      </div>
      
      {isAdmin && !isCurrentUser && (
        <div className="flex items-center gap-2">
          {member.teamRole !== 'ADMIN' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onTransferOwnership}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Make Admin
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Transfer team ownership to this member</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive" 
                  onClick={onRemove}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4" />
                  )}
                  <span className="sr-only">Remove Member</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove from Team</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
} 