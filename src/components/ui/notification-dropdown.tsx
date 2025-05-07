"use client"

// This file manages notifications for users
// Bug fixed: Only show jam team requests for jams created by the current user
// This ensures only jam organizers see join requests, not team members

import * as React from "react"
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Users, 
  UserPlus, 
  MailPlus, 
  Mail,
  GamepadIcon
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu"
import { TeamInvitation } from "@/types/team"
import { jamTeamApi } from "@/lib/api/jam-team"
import { JamTeamInvitation, JamTeamRequest } from "@/types/jam-team"
import { teamApi } from "@/lib/api/team"
import { jamApi } from "@/lib/api/jam"
import { Jam } from "@/types/jam"

interface NotificationDropdownProps {
  className?: string
}

// Update the interfaces
interface TeamInvitationItemProps {
  invitation: TeamInvitation;
  actionInProgress: { [key: string]: boolean };
  onAccept: (invitation: TeamInvitation) => void;
  onReject: (invitation: TeamInvitation) => void;
}

interface JamInvitationItemProps {
  invitation: JamTeamInvitation;
  actionInProgress: { [key: string]: boolean };
  onAccept: (invitation: JamTeamInvitation) => void;
  onReject: (invitation: JamTeamInvitation) => void;
}

interface JamRequestItemProps {
  request: JamTeamRequest;
  actionInProgress: { [key: string]: boolean };
  onAccept: (request: JamTeamRequest) => void;
  onReject: (request: JamTeamRequest) => void;
}

interface NotificationActionsProps {
  id: string;
  actionInProgress: { [key: string]: boolean };
  onAccept: () => void;
  onReject: () => void;
}

// Custom hook to handle notification logic
export function useNotifications() {
  const [teamInvitations, setTeamInvitations] = React.useState<TeamInvitation[]>([])
  const [jamInvitations, setJamInvitations] = React.useState<JamTeamInvitation[]>([])
  const [jamRequests, setJamRequests] = React.useState<JamTeamRequest[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [actionInProgress, setActionInProgress] = React.useState<{[key: string]: boolean}>({})

  const fetchAllNotifications = async () => {
    setIsLoading(true)
    try {
      // Get team invitations
      try {
        const teamInvs = await teamApi.getUserPendingInvitations();
        setTeamInvitations(teamInvs);
        console.log("Team invitations loaded:", teamInvs);
      } catch (teamError) {
        console.error("Error fetching team invitations:", teamError);
        // Continue with other notifications even if team invitations fail
      }

      // Get jam invitations and requests if user has teams
      try {
        const userTeams = await teamApi.getUserTeams();
        console.log("User teams loaded:", userTeams);
        
        if (userTeams && userTeams.length > 0) {
          try {
            // Get jam invitations
            const jamInvsPromises = userTeams.map(team => 
              jamTeamApi.getTeamPendingInvitations(team.id)
                .then(invs => {
                  console.log("Jam invitations for team", team.id, invs);
                  return invs;
                })
                .catch(err => {
                  console.error(`Error fetching jam invitations for team ${team.id}:`, err);
                  return [];
                })
            );
            
            const jamInvs = await Promise.all(jamInvsPromises);
            const flattenedJamInvs = jamInvs.flat();
            console.log("Jam invitations loaded:", flattenedJamInvs);
            setJamInvitations(flattenedJamInvs);
            
            // Get jam requests - ONLY for jams created by current user
            const userJams = await jamApi.getUserJams();
            console.log("User created jams:", userJams);
            
            if (userJams && userJams.length > 0) {
              // Get requests for jams created by the user
              const jamReqsPromises = userJams.map((jam) => 
                jamTeamApi.getJamPendingRequests(jam.id)
                  .catch((err) => {
                    console.error(`Error fetching jam requests for jam ${jam.id}:`, err);
                    return [];
                  })
              );
              
              const jamReqs = await Promise.all(jamReqsPromises);
              const flattenedJamReqs = jamReqs.flat();
              console.log("Jam requests loaded (user's jams only):", flattenedJamReqs);
              setJamRequests(flattenedJamReqs);
            } else {
              console.log("No jams created by current user");
              setJamRequests([]);
            }
          } catch (jamError) {
            console.error("Error processing jam notifications:", jamError);
            setJamRequests([]);
          }
        } else {
          console.log("No teams found for user or teams array is empty");
        }
      } catch (teamsError) {
        console.error("Error fetching user teams:", teamsError);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }

  // Team invitation handlers
  const handleAcceptTeamInvitation = async (invitation: TeamInvitation) => {
    setActionInProgress({ ...actionInProgress, [invitation.id]: true })
    try {
      await teamApi.acceptInvitation(invitation.token)
      setTeamInvitations(teamInvitations.filter(inv => inv.id !== invitation.id))
      toast.success(`You have joined ${invitation.teamName}`)
    } catch (err) {
      toast.error('Failed to accept team invitation')
    } finally {
      const newActionInProgress = { ...actionInProgress }
      delete newActionInProgress[invitation.id]
      setActionInProgress(newActionInProgress)
    }
  }

  const handleRejectTeamInvitation = async (invitation: TeamInvitation) => {
    setActionInProgress({ ...actionInProgress, [invitation.id]: true })
    try {
      await teamApi.rejectInvitation(invitation.token)
      setTeamInvitations(teamInvitations.filter(inv => inv.id !== invitation.id))
      toast.success("You have declined the team invitation")
    } catch (err) {
      toast.error('Failed to reject team invitation')
    } finally {
      const newActionInProgress = { ...actionInProgress }
      delete newActionInProgress[invitation.id]
      setActionInProgress(newActionInProgress)
    }
  }

  // Jam team invitation handlers
  const handleAcceptJamInvitation = async (invitation: JamTeamInvitation) => {
    setActionInProgress({ ...actionInProgress, [invitation.id]: true })
    try {
      await jamTeamApi.acceptJamTeamInvitation(invitation.id)
      setJamInvitations(jamInvitations.filter(inv => inv.id !== invitation.id))
      toast.success(`Your team has joined ${invitation.jamName}`)
    } catch (err) {
      toast.error('Failed to accept jam invitation')
    } finally {
      const newActionInProgress = { ...actionInProgress }
      delete newActionInProgress[invitation.id]
      setActionInProgress(newActionInProgress)
    }
  }

  const handleRejectJamInvitation = async (invitation: JamTeamInvitation) => {
    setActionInProgress({ ...actionInProgress, [invitation.id]: true })
    try {
      await jamTeamApi.rejectJamTeamInvitation(invitation.id)
      setJamInvitations(jamInvitations.filter(inv => inv.id !== invitation.id))
      toast.success("You have declined the jam invitation")
    } catch (err) {
      toast.error('Failed to reject jam invitation')
    } finally {
      const newActionInProgress = { ...actionInProgress }
      delete newActionInProgress[invitation.id]
      setActionInProgress(newActionInProgress)
    }
  }

  // Jam team request handlers
  const handleAcceptJamRequest = async (request: JamTeamRequest) => {
    setActionInProgress({ ...actionInProgress, [request.id]: true })
    try {
      await jamTeamApi.acceptJamTeamRequest(request.id)
      setJamRequests(jamRequests.filter(req => req.id !== request.id))
      toast.success(`${request.teamName} has been added to your jam`)
    } catch (err) {
      toast.error('Failed to accept team request')
    } finally {
      const newActionInProgress = { ...actionInProgress }
      delete newActionInProgress[request.id]
      setActionInProgress(newActionInProgress)
    }
  }

  const handleRejectJamRequest = async (request: JamTeamRequest) => {
    setActionInProgress({ ...actionInProgress, [request.id]: true })
    try {
      await jamTeamApi.rejectJamTeamRequest(request.id)
      setJamRequests(jamRequests.filter(req => req.id !== request.id))
      toast.success("You have declined the team request")
    } catch (err) {
      toast.error('Failed to reject team request')
    } finally {
      const newActionInProgress = { ...actionInProgress }
      delete newActionInProgress[request.id]
      setActionInProgress(newActionInProgress)
    }
  }

  // Initialize notifications on mount
  React.useEffect(() => {
    fetchAllNotifications()
  }, [])

  return {
    teamInvitations,
    jamInvitations,
    jamRequests,
    isLoading,
    actionInProgress,
    fetchAllNotifications,
    handleAcceptTeamInvitation,
    handleRejectTeamInvitation,
    handleAcceptJamInvitation,
    handleRejectJamInvitation,
    handleAcceptJamRequest,
    handleRejectJamRequest
  }
}

// Dropdown component for notifications
export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const {
    teamInvitations,
    jamInvitations,
    jamRequests,
    isLoading,
    actionInProgress,
    fetchAllNotifications,
    handleAcceptTeamInvitation,
    handleRejectTeamInvitation,
    handleAcceptJamInvitation,
    handleRejectJamInvitation,
    handleAcceptJamRequest,
    handleRejectJamRequest
  } = useNotifications()

  const totalNotifications = teamInvitations.length + jamInvitations.length + jamRequests.length
  
  const renderLoadingState = () => (
    <div className="flex justify-center items-center py-6">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  const renderEmptyState = () => (
    <div className="px-2 py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
      <Mail className="h-12 w-12 text-muted-foreground/50" />
      <span>No notifications</span>
    </div>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MailPlus className="h-5 w-5" />
          {totalNotifications > 0 && (
            <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {totalNotifications}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96" align="end" forceMount>
        <DropdownMenuLabel className="font-normal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MailPlus className="h-4 w-4" />
            <span className="text-sm font-semibold">Notifications</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              fetchAllNotifications()
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          renderLoadingState()
        ) : totalNotifications === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Team Invitations */}
            {teamInvitations.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-semibold px-2 py-1.5">
                  <div className="flex items-center gap-1">
                    <UserPlus className="h-3.5 w-3.5" />
                    Team Invitations
                  </div>
                </DropdownMenuLabel>
                {teamInvitations.map((invitation) => (
                  <TeamInvitationItem
                    key={invitation.id}
                    invitation={invitation}
                    actionInProgress={actionInProgress}
                    onAccept={handleAcceptTeamInvitation}
                    onReject={handleRejectTeamInvitation}
                  />
                ))}
              </DropdownMenuGroup>
            )}

            {/* Jam Team Invitations */}
            {jamInvitations.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-semibold px-2 py-1.5">
                  <div className="flex items-center gap-1">
                    <GamepadIcon className="h-3.5 w-3.5" />
                    Jam Invitations
                  </div>
                </DropdownMenuLabel>
                {jamInvitations.map((invitation) => (
                  <JamInvitationItem
                    key={invitation.id}
                    invitation={invitation}
                    actionInProgress={actionInProgress}
                    onAccept={handleAcceptJamInvitation}
                    onReject={handleRejectJamInvitation}
                  />
                ))}
              </DropdownMenuGroup>
            )}

            {/* Jam Team Requests */}
            {jamRequests.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-semibold px-2 py-1.5">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    Team Requests
                  </div>
                </DropdownMenuLabel>
                {jamRequests.map((request) => (
                  <JamRequestItem
                    key={request.id}
                    request={request}
                    actionInProgress={actionInProgress}
                    onAccept={handleAcceptJamRequest}
                    onReject={handleRejectJamRequest}
                  />
                ))}
              </DropdownMenuGroup>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Individual notification item components
function TeamInvitationItem({ invitation, actionInProgress, onAccept, onReject }: TeamInvitationItemProps) {
  return (
    <DropdownMenuItem className="cursor-default flex flex-col items-start py-3">
      <div className="font-medium flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-primary" />
        <span>Join team {invitation.teamName}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground mt-1 mb-2">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>Sent: {formatDate(invitation.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>Expires: {formatDate(invitation.expiresAt)}</span>
        </div>
      </div>
      <NotificationActions
        id={invitation.id}
        actionInProgress={actionInProgress}
        onAccept={() => onAccept(invitation)}
        onReject={() => onReject(invitation)}
      />
    </DropdownMenuItem>
  )
}

function JamInvitationItem({ invitation, actionInProgress, onAccept, onReject }: JamInvitationItemProps) {
  return (
    <DropdownMenuItem className="cursor-default flex flex-col items-start py-3">
      <div className="font-medium flex items-center gap-2">
        <GamepadIcon className="h-4 w-4 text-primary" />
        <span>Join jam {invitation.jamName} with team {invitation.teamName}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground mt-1 mb-2">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>Sent: {formatDate(invitation.createdAt)}</span>
        </div>
      </div>
      <NotificationActions
        id={invitation.id}
        actionInProgress={actionInProgress}
        onAccept={() => onAccept(invitation)}
        onReject={() => onReject(invitation)}
      />
    </DropdownMenuItem>
  )
}

function JamRequestItem({ request, actionInProgress, onAccept, onReject }: JamRequestItemProps) {
  return (
    <DropdownMenuItem className="cursor-default flex flex-col items-start py-3">
      <div className="font-medium flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <span>Team {request.teamName} wants to join {request.jamName}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground mt-1 mb-2">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>Requested: {formatDate(request.createdAt)}</span>
        </div>
      </div>
      <NotificationActions
        id={request.id}
        actionInProgress={actionInProgress}
        onAccept={() => onAccept(request)}
        onReject={() => onReject(request)}
      />
    </DropdownMenuItem>
  )
}

function NotificationActions({ id, actionInProgress, onAccept, onReject }: NotificationActionsProps) {
  return (
    <div className="flex w-full justify-end gap-2 mt-1">
      <Button 
        size="sm" 
        variant="outline"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onReject()
        }}
        disabled={actionInProgress[id]}
      >
        {actionInProgress[id] ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <XCircle className="h-4 w-4 mr-2" />
        )}
        Decline
      </Button>
      <Button 
        size="sm"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onAccept()
        }}
        disabled={actionInProgress[id]}
      >
        {actionInProgress[id] ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4 mr-2" />
        )}
        Accept
      </Button>
    </div>
  )
}

// Add shared state renderers
const renderLoadingState = () => (
  <div className="flex justify-center items-center py-6">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
)

const renderEmptyState = () => (
  <div className="px-2 py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
    <Mail className="h-12 w-12 text-muted-foreground/50" />
    <span>No notifications</span>
  </div>
)

// Update the MobileNotifications component to use shared state renderers
export function MobileNotifications() {
  const {
    teamInvitations,
    jamInvitations,
    jamRequests,
    isLoading,
    actionInProgress,
    handleAcceptTeamInvitation,
    handleRejectTeamInvitation,
    handleAcceptJamInvitation,
    handleRejectJamInvitation,
    handleAcceptJamRequest,
    handleRejectJamRequest
  } = useNotifications()

  const totalNotifications = teamInvitations.length + jamInvitations.length + jamRequests.length

  if (isLoading) {
    return renderLoadingState()
  }

  if (totalNotifications === 0) {
    return renderEmptyState()
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium flex items-center gap-2">
        <MailPlus className="h-4 w-4" />
        Notifications ({totalNotifications})
      </h3>

      {teamInvitations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <UserPlus className="h-3.5 w-3.5" />
            Team Invitations
          </h4>
          {teamInvitations.map((invitation) => (
            <TeamInvitationItem
              key={invitation.id}
              invitation={invitation}
              actionInProgress={actionInProgress}
              onAccept={handleAcceptTeamInvitation}
              onReject={handleRejectTeamInvitation}
            />
          ))}
        </div>
      )}

      {jamInvitations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <GamepadIcon className="h-3.5 w-3.5" />
            Jam Invitations
          </h4>
          {jamInvitations.map((invitation) => (
            <JamInvitationItem
              key={invitation.id}
              invitation={invitation}
              actionInProgress={actionInProgress}
              onAccept={handleAcceptJamInvitation}
              onReject={handleRejectJamInvitation}
            />
          ))}
        </div>
      )}

      {jamRequests.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Team Requests
          </h4>
          {jamRequests.map((request) => (
            <JamRequestItem
              key={request.id}
              request={request}
              actionInProgress={actionInProgress}
              onAccept={handleAcceptJamRequest}
              onReject={handleRejectJamRequest}
            />
          ))}
        </div>
      )}
    </div>
  )
} 